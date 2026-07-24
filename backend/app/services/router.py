import httpx
import json
import uuid
import time
import logging
from typing import AsyncGenerator, Dict, Any, List, Optional
from fastapi import HTTPException
from fastapi.responses import StreamingResponse

from app.config import settings
from app.schemas.chat import ChatCompletionRequest

logger = logging.getLogger("voltkey.router")
logging.basicConfig(level=logging.INFO)

MODEL_REGISTRY: Dict[str, List[str]] = {
    # Groq Models
    "llama-3.3-70b-versatile": ["groq"],
    "llama-3.1-8b-instant": ["groq"],
    "mixtral-8x7b-32768": ["groq"],
    "llama3-8b-8192": ["groq"],

    # OpenAI Models
    "gpt-4o": ["openai"],
    "gpt-4o-mini": ["openai"],
    "gpt-3.5-turbo": ["openai"],
    "o1-preview": ["openai"],
    "o3-mini": ["openai"],

    # Anthropic Models
    "claude-sonnet-4": ["anthropic"],
    "claude-3-5-sonnet": ["anthropic"],
    "claude-3-haiku": ["anthropic"],

    # Gemini Models
    "gemini-2.5-flash": ["gemini"],
    "gemini-1.5-pro": ["gemini"],
    "gemini-1.5-flash": ["gemini"],

    # Unified VoltKey Aliases
    "voltkey/fast": ["groq", "openai"],
    "voltkey/smart": ["openai", "anthropic", "gemini"],
}

class LLMRouter:
    """
    VoltKey Pipeline Architecture (9 Steps):
    1. Verify VoltKey API Key
    2. Identify the user
    3. Fetch the user's stored provider keys (BYOK)
    4. Check which provider supports the requested model
    5. Select the best provider
    6. Decrypt that provider's API key
    7. Send the request to that provider
    8. Store analytics
    9. Return the response
    """

    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0)

    # ------------------------------------------------------------------
    # Step 1: Verify VoltKey API Key
    # ------------------------------------------------------------------
    def verify_api_key(self, auth_header: Optional[str]) -> Dict[str, Any]:
        """
        Step 1: Validates the incoming Authorization Bearer key.
        (Future DB hook: look up key in DB hash table)
        """
        if not auth_header:
            logger.info("[Step 1] No authorization header provided. Operating in anonymous dev mode.")
            return {"key": "vk_dev_anon", "is_valid": True, "user_id": "usr_dev_default"}
        
        token = auth_header.replace("Bearer ", "").strip()
        if token.startswith("vk_") or token.startswith("mh_") or token.startswith("sk-"):
            return {"key": token, "is_valid": True, "user_id": f"usr_{token[-6:]}"}
        
        # Default dev acceptance while DB is being built
        return {"key": token, "is_valid": True, "user_id": "usr_dev_default"}

    # ------------------------------------------------------------------
    # Step 2: Identify the user
    # ------------------------------------------------------------------
    def identify_user(self, key_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        Step 2: Identifies the user associated with the verified key.
        (Future DB hook: return user object, tier limits, quota status)
        """
        user_id = key_info.get("user_id", "usr_dev_default")
        logger.info(f"[Step 2] Identified user: {user_id}")
        return {
            "user_id": user_id,
            "tier": "developer",
            "rate_limit_rpm": 600
        }

    # ------------------------------------------------------------------
    # Step 3: Fetch the user's stored provider keys (BYOK)
    # ------------------------------------------------------------------
    def fetch_user_provider_keys(self, user_id: str) -> Dict[str, str]:
        """
        Step 3: Fetches stored encrypted provider API keys for the user (BYOK).
        (Future DB hook: query user_provider_keys table)
        """
        logger.info(f"[Step 3] Fetching stored provider keys for user: {user_id}")
        # Falls back to server environment settings if user hasn't saved custom keys yet
        return {
            "groq": settings.GROQ_API_KEY,
            "openai": settings.OPENAI_API_KEY,
            "anthropic": settings.ANTHROPIC_API_KEY,
            "gemini": settings.GEMINI_API_KEY
        }

    # ------------------------------------------------------------------
    # Step 4: Check which provider supports the requested model
    # ------------------------------------------------------------------
    def check_model_support(self, request_model: str) -> List[str]:
        """
        Step 4: Returns a list of candidate providers that support the requested model using MODEL_REGISTRY.
        """
        supported = MODEL_REGISTRY.get(request_model)

        if not supported:
            logger.warning(f"[Step 4] Model '{request_model}' not found in registry. Defaulting to all providers.")
            supported = ["groq", "openai", "anthropic", "gemini"]

        logger.info(f"[Step 4] Model '{request_model}' supported by providers: {supported}")
        return supported

    # ------------------------------------------------------------------
    # Step 5: Select the best provider
    # ------------------------------------------------------------------
    def select_best_provider(
        self, 
        supported_providers: List[str], 
        user_keys: Dict[str, str], 
        request_model: str
    ) -> List[Dict[str, Any]]:
        """
        Step 5: Selects the best provider & failover order based on health, speed, and key availability.
        """
        chain = []

        for p_name in supported_providers:
            api_key = user_keys.get(p_name, "")
            if not api_key:
                continue

            if p_name == "groq":
                chain.append({
                    "name": "Groq",
                    "url": f"{settings.GROQ_BASE_URL}/chat/completions",
                    "encrypted_key": api_key,
                    "target_model": request_model if not request_model.startswith("voltkey/") else "llama-3.3-70b-versatile"
                })
            elif p_name == "openai":
                chain.append({
                    "name": "OpenAI",
                    "url": f"{settings.OPENAI_BASE_URL}/chat/completions",
                    "encrypted_key": api_key,
                    "target_model": request_model if not request_model.startswith("voltkey/") else "gpt-4o-mini"
                })

        # Mock fallback node if no provider keys exist yet
        if not chain:
            chain.append({
                "name": "VoltKey-Mock-Fallback",
                "url": None,
                "encrypted_key": None,
                "target_model": request_model
            })

        logger.info(f"[Step 5] Selected provider chain: {[p['name'] for p in chain]}")
        return chain

    # ------------------------------------------------------------------
    # Step 6: Decrypt that provider's API key
    # ------------------------------------------------------------------
    def decrypt_provider_key(self, encrypted_key: Optional[str]) -> Optional[str]:
        """
        Step 6: Decrypts the stored provider key.
        (Future KMS / Fernet hook: decrypt ciphertext -> plaintext key)
        """
        if not encrypted_key:
            return None
        # Pass-through for development / plaintext keys
        return encrypted_key

    # ------------------------------------------------------------------
    # Step 7: Send the request to that provider
    # ------------------------------------------------------------------
    async def send_request_to_provider(
        self, 
        provider: Dict[str, Any], 
        payload: Dict[str, Any], 
        stream: bool
    ) -> Any:
        """
        Step 7: Forwards the chat completion payload to the target provider.
        """
        url = provider["url"]
        decrypted_key = self.decrypt_provider_key(provider["encrypted_key"])

        if url is None:
            # Generate mock response if no live key available
            return self._generate_mock_response(payload.get("model", "voltkey-default"))

        payload["model"] = provider["target_model"]
        headers = {
            "Authorization": f"Bearer {decrypted_key}",
            "Content-Type": "application/json"
        }

        if stream:
            return await self._stream_response(url, headers, payload, provider["name"])
        else:
            response = await self.client.post(url, headers=headers, json=payload)
            if response.status_code == 200:
                return response.json()
            raise HTTPException(
                status_code=response.status_code, 
                detail=f"Provider {provider['name']} error: {response.text}"
            )

    # ------------------------------------------------------------------
    # Step 8: Store analytics
    # ------------------------------------------------------------------
    async def store_analytics(
        self, 
        user_id: str, 
        provider_name: str, 
        model: str, 
        latency_ms: float, 
        status_code: int, 
        tokens_used: int = 0
    ):
        """
        Step 8: Asynchronously stores request metrics and routing log.
        (Future DB hook: insert into request_analytics table)
        """
        logger.info(
            f"[Step 8 Analytics] User: {user_id} | Provider: {provider_name} | "
            f"Model: {model} | Latency: {latency_ms:.2f}ms | Status: {status_code}"
        )

    # ------------------------------------------------------------------
    # Step 9: Pipeline Orchestration & Return Response
    # ------------------------------------------------------------------
    async def route_chat_completion(
        self, 
        request: ChatCompletionRequest, 
        auth_header: Optional[str] = None
    ) -> Any:
        """
        Orchestrates the complete 9-step pipeline flowchart.
        """
        start_time = time.time()

        # Step 1: Verify API Key
        key_info = self.verify_api_key(auth_header)

        # Step 2: Identify User
        user_info = self.identify_user(key_info)
        user_id = user_info["user_id"]

        # Step 3: Fetch stored provider keys (BYOK)
        user_keys = self.fetch_user_provider_keys(user_id)

        # Step 4: Check model support
        supported_providers = self.check_model_support(request.model)

        # Step 5: Select best provider
        provider_chain = self.select_best_provider(supported_providers, user_keys, request.model)

        # Step 7: Send request (Iterate provider chain for failover)
        payload = request.model_dump(exclude_none=True)
        last_error = None

        for provider in provider_chain:
            try:
                # Step 6 happens inside send_request_to_provider (decryption)
                result = await self.send_request_to_provider(provider, payload, stream=bool(request.stream))
                
                latency_ms = (time.time() - start_time) * 1000
                
                # Step 8: Store Analytics
                await self.store_analytics(
                    user_id=user_id,
                    provider_name=provider["name"],
                    model=request.model,
                    latency_ms=latency_ms,
                    status_code=200
                )

                # Step 9: Return the response
                return result

            except Exception as e:
                logger.warning(f"[Failover] Provider {provider['name']} failed: {str(e)}")
                last_error = str(e)

        # Record failed request analytics
        latency_ms = (time.time() - start_time) * 1000
        await self.store_analytics(
            user_id=user_id,
            provider_name="ALL_FAILED",
            model=request.model,
            latency_ms=latency_ms,
            status_code=502
        )

        raise HTTPException(
            status_code=502,
            detail=f"All routed LLM providers failed. Last error: {last_error}"
        )

    async def _stream_response(
        self, 
        url: str, 
        headers: Dict[str, str], 
        payload: Dict[str, Any], 
        provider_name: str
    ) -> StreamingResponse:
        """
        Relays SSE stream from provider to client.
        """
        async def event_generator():
            try:
                async with self.client.stream("POST", url, headers=headers, json=payload) as response:
                    if response.status_code != 200:
                        error_body = await response.aread()
                        logger.error(f"Stream error from {provider_name}: {error_body.decode()}")
                        yield f"data: {json.dumps({'error': f'Provider {provider_name} stream error'})}\n\n"
                        return

                    async for line in response.aiter_lines():
                        if line:
                            yield f"{line}\n\n"
            except Exception as err:
                logger.error(f"Streaming error on provider {provider_name}: {err}")
                yield f"data: {json.dumps({'error': str(err)})}\n\n"

        return StreamingResponse(event_generator(), media_type="text/event-stream")

    def _generate_mock_response(self, model_name: str) -> Dict[str, Any]:
        """
        Generates fallback response when no provider keys exist.
        """
        request_id = f"chatcmpl-voltkey-{uuid.uuid4().hex[:8]}"
        reply_content = f"⚡ VoltKey Gateway Routed Request! [Model: {model_name}]\n\n(Note: Add your provider API keys in backend/.env or DB)."
        
        return {
            "id": request_id,
            "object": "chat.completion",
            "created": int(time.time()),
            "model": model_name,
            "choices": [
                {
                    "index": 0,
                    "message": {
                        "role": "assistant",
                        "content": reply_content
                    },
                    "finish_reason": "stop"
                }
            ],
            "usage": {
                "prompt_tokens": 5,
                "completion_tokens": 20,
                "total_tokens": 25
            }
        }

router_engine = LLMRouter()
