"""
VoltKey LLM Router — 9-step pipeline with all DB hooks implemented.

DB touchpoints (per database_guide.md):
  Step 1 → verify_api_key()           DB: look up key_hash in api_keys table
  Step 2 → identify_user()            DB: fetch user + rate limits from users table
  Step 3 → fetch_user_provider_keys() DB: fetch encrypted BYOK keys
  Step 6 → decrypt_provider_key()     KMS: Fernet decrypt ciphertext
  Step 8 → store_analytics()          DB: insert row into request_analytics
"""

import hashlib
import httpx
import json
import logging
import time
import uuid
from typing import Any, AsyncGenerator, Dict, List, Optional

from cryptography.fernet import Fernet, InvalidToken
from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.db.models import ApiKey, RequestAnalytics, User, UserProviderKey
from app.schemas.chat import ChatCompletionRequest

logger = logging.getLogger("voltkey.router")
logging.basicConfig(level=logging.INFO)

# ── Fernet cipher (lazy singleton — key guaranteed by config auto-gen) ─────────
_fernet: Optional[Fernet] = None


def _get_fernet() -> Fernet:
    global _fernet
    if _fernet is None:
        _fernet = Fernet(settings.ENCRYPTION_SECRET_KEY.encode())
    return _fernet


# ── Model registry ─────────────────────────────────────────────────────────────
MODEL_REGISTRY: Dict[str, List[str]] = {
    # Groq (OpenAI-compatible)
    "llama-3.3-70b-versatile": ["groq"],
    "llama-3.1-8b-instant":    ["groq"],
    "mixtral-8x7b-32768":      ["groq"],
    "llama3-8b-8192":          ["groq"],

    # OpenAI
    "gpt-4o":                  ["openai"],
    "gpt-4o-mini":             ["openai"],
    "gpt-3.5-turbo":           ["openai"],
    "o1-preview":              ["openai"],
    "o3-mini":                 ["openai"],

    # Anthropic (native Messages API)
    "claude-sonnet-4-5":       ["anthropic"],
    "claude-3-5-sonnet-20241022": ["anthropic"],
    "claude-3-haiku-20240307": ["anthropic"],

    # Gemini (OpenAI-compatible endpoint)
    "gemini-2.5-flash":        ["gemini"],
    "gemini-1.5-pro":          ["gemini"],
    "gemini-1.5-flash":        ["gemini"],

    # Mistral (OpenAI-compatible)
    "mistral-large-latest":    ["mistral"],
    "mistral-small-latest":    ["mistral"],
    "open-mixtral-8x7b":       ["mistral"],

    # Together AI (OpenAI-compatible)
    "meta-llama/Llama-3-70b-chat-hf":   ["together"],
    "mistralai/Mixtral-8x7B-Instruct-v0.1": ["together"],

    # Unified VoltKey aliases — route across providers for best availability
    "voltkey/fast":  ["groq", "openai", "mistral"],
    "voltkey/smart": ["openai", "anthropic", "gemini"],
}

# Providers that use the standard OpenAI-compatible format (Bearer token, JSON payload)
_OPENAI_COMPATIBLE = {"groq", "openai", "gemini", "mistral", "together"}

# Anthropic API version header
_ANTHROPIC_VERSION = "2023-06-01"


class LLMRouter:
    """
    VoltKey Pipeline Architecture (9 Steps):
    1. Verify VoltKey API Key    — DB hash lookup
    2. Identify the user         — DB user fetch
    3. Fetch user provider keys  — DB BYOK fetch
    4. Check model support       — MODEL_REGISTRY
    5. Select best provider      — key availability + ordering
    6. Decrypt provider key      — Fernet decrypt
    7. Send to provider          — httpx proxy
    8. Store analytics           — DB insert
    9. Return response
    """

    def __init__(self) -> None:
        self.client = httpx.AsyncClient(timeout=60.0)

    # ──────────────────────────────────────────────────────────────────────────
    # Step 1: Verify VoltKey API Key
    # ──────────────────────────────────────────────────────────────────────────
    async def verify_api_key(
        self,
        auth_header: Optional[str],
        db: Optional[AsyncSession],
    ) -> Dict[str, Any]:
        """Hashes the Bearer token and looks it up in api_keys. Falls back to dev mode."""
        if not auth_header:
            logger.info("[Step 1] No auth header — anonymous dev mode.")
            return {"key": "vk_dev_anon", "is_valid": True, "user_id": "usr_dev_default", "key_id": None}

        token = auth_header.replace("Bearer ", "").strip()

        if db is None:
            logger.warning("[Step 1] No DB session — passthrough (no DB configured).")
            return {"key": token, "is_valid": True, "user_id": "usr_dev_default", "key_id": None}

        hashed = hashlib.sha256(token.encode()).hexdigest()
        result = await db.execute(
            select(ApiKey).where(ApiKey.key_hash == hashed, ApiKey.is_active == True)
        )
        key_record = result.scalar_one_or_none()

        if not key_record:
            raise HTTPException(status_code=401, detail="Invalid or revoked API key")

        logger.info(f"[Step 1] Valid key {key_record.id} for user {key_record.user_id}")
        return {
            "key": token,
            "is_valid": True,
            "user_id": key_record.user_id,
            "key_id": key_record.id,
        }

    # ──────────────────────────────────────────────────────────────────────────
    # Step 2: Identify the user
    # ──────────────────────────────────────────────────────────────────────────
    async def identify_user(
        self,
        user_id: str,
        db: Optional[AsyncSession],
    ) -> Dict[str, Any]:
        """Fetches the user row and their plan limits."""
        if user_id == "usr_dev_default" or db is None:
            return {"user_id": user_id, "tier": "developer", "rate_limit_rpm": 600}

        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(status_code=404, detail=f"User {user_id} not found")

        logger.info(f"[Step 2] {user.email} | {user.plan_name} | {user.rate_limit_rpm} RPM")
        return {
            "user_id": user.id,
            "email": user.email,
            "tier": user.plan_name,
            "rate_limit_rpm": user.rate_limit_rpm,
        }

    # ──────────────────────────────────────────────────────────────────────────
    # Step 3: Fetch stored provider keys (BYOK)
    # ──────────────────────────────────────────────────────────────────────────
    async def fetch_user_provider_keys(
        self,
        user_id: str,
        db: Optional[AsyncSession],
    ) -> Dict[str, str]:
        """Loads encrypted BYOK keys; falls back to platform env keys."""
        user_keys: Dict[str, str] = {}

        if user_id != "usr_dev_default" and db is not None:
            result = await db.execute(
                select(UserProviderKey).where(UserProviderKey.user_id == user_id)
            )
            records = result.scalars().all()
            user_keys = {r.provider_name: r.encrypted_key for r in records}

        logger.info(f"[Step 3] BYOK providers for {user_id}: {list(user_keys.keys())}")

        return {
            "groq":      user_keys.get("groq")      or settings.GROQ_API_KEY,
            "openai":    user_keys.get("openai")    or settings.OPENAI_API_KEY,
            "anthropic": user_keys.get("anthropic") or settings.ANTHROPIC_API_KEY,
            "gemini":    user_keys.get("gemini")    or settings.GEMINI_API_KEY,
            "mistral":   user_keys.get("mistral")   or settings.MISTRAL_API_KEY,
            "together":  user_keys.get("together")  or settings.TOGETHER_API_KEY,
        }

    # ──────────────────────────────────────────────────────────────────────────
    # Step 4: Check model support
    # ──────────────────────────────────────────────────────────────────────────
    def check_model_support(self, request_model: str) -> List[str]:
        supported = MODEL_REGISTRY.get(request_model)
        if not supported:
            logger.warning(f"[Step 4] Unknown model '{request_model}' — trying all providers.")
            supported = list(_OPENAI_COMPATIBLE) + ["anthropic"]
        logger.info(f"[Step 4] '{request_model}' → {supported}")
        return supported

    # ──────────────────────────────────────────────────────────────────────────
    # Step 5: Select best provider chain
    # ──────────────────────────────────────────────────────────────────────────
    def select_best_provider(
        self,
        supported_providers: List[str],
        user_keys: Dict[str, str],
        request_model: str,
    ) -> List[Dict[str, Any]]:
        chain: List[Dict[str, Any]] = []

        is_alias = request_model.startswith("voltkey/")

        for p_name in supported_providers:
            api_key = user_keys.get(p_name, "")
            if not api_key:
                continue

            if p_name == "groq":
                chain.append({
                    "name": "Groq",
                    "provider_id": "groq",
                    "url": f"{settings.GROQ_BASE_URL}/chat/completions",
                    "encrypted_key": api_key,
                    "target_model": "llama-3.3-70b-versatile" if is_alias else request_model,
                })
            elif p_name == "openai":
                chain.append({
                    "name": "OpenAI",
                    "provider_id": "openai",
                    "url": f"{settings.OPENAI_BASE_URL}/chat/completions",
                    "encrypted_key": api_key,
                    "target_model": "gpt-4o-mini" if is_alias else request_model,
                })
            elif p_name == "anthropic":
                # Anthropic native Messages API — different URL, headers, and payload format
                chain.append({
                    "name": "Anthropic",
                    "provider_id": "anthropic",
                    "url": f"{settings.ANTHROPIC_BASE_URL}/messages",
                    "encrypted_key": api_key,
                    "target_model": "claude-3-haiku-20240307" if is_alias else request_model,
                })
            elif p_name == "gemini":
                # Gemini OpenAI-compatible endpoint — standard Bearer auth
                chain.append({
                    "name": "Gemini",
                    "provider_id": "gemini",
                    "url": f"{settings.GEMINI_BASE_URL}/chat/completions",
                    "encrypted_key": api_key,
                    "target_model": "gemini-1.5-flash" if is_alias else request_model,
                })
            elif p_name == "mistral":
                chain.append({
                    "name": "Mistral",
                    "provider_id": "mistral",
                    "url": f"{settings.MISTRAL_BASE_URL}/chat/completions",
                    "encrypted_key": api_key,
                    "target_model": "mistral-small-latest" if is_alias else request_model,
                })
            elif p_name == "together":
                chain.append({
                    "name": "Together",
                    "provider_id": "together",
                    "url": f"{settings.TOGETHER_BASE_URL}/chat/completions",
                    "encrypted_key": api_key,
                    "target_model": "meta-llama/Llama-3-70b-chat-hf" if is_alias else request_model,
                })

        if not chain:
            chain.append({
                "name": "VoltKey-Mock-Fallback",
                "provider_id": "mock",
                "url": None,
                "encrypted_key": None,
                "target_model": request_model,
            })

        logger.info(f"[Step 5] Chain: {[p['name'] for p in chain]}")
        return chain

    # ──────────────────────────────────────────────────────────────────────────
    # Step 6: Decrypt provider key
    # ──────────────────────────────────────────────────────────────────────────
    def decrypt_provider_key(self, encrypted_key: Optional[str]) -> Optional[str]:
        """
        Fernet-decrypts a stored BYOK ciphertext.
        Passes through plaintext keys (platform env vars / dev keys).
        """
        if not encrypted_key:
            return None

        PLAINTEXT_PREFIXES = ("gsk_", "sk-", "AIza", "vk_")
        if any(encrypted_key.startswith(p) for p in PLAINTEXT_PREFIXES):
            return encrypted_key

        try:
            return _get_fernet().decrypt(encrypted_key.encode()).decode()
        except (InvalidToken, Exception) as exc:
            logger.error(f"[Step 6] Fernet decryption failed: {exc}")
            return None

    # ──────────────────────────────────────────────────────────────────────────
    # Step 7: Send request to provider
    # ──────────────────────────────────────────────────────────────────────────
    async def send_request_to_provider(
        self,
        provider: Dict[str, Any],
        payload: Dict[str, Any],
        stream: bool,
    ) -> Any:
        url = provider["url"]
        provider_id = provider["provider_id"]
        decrypted_key = self.decrypt_provider_key(provider["encrypted_key"])

        if url is None:
            return self._generate_mock_response(payload.get("model", "voltkey-default"))

        payload["model"] = provider["target_model"]

        # ── Build provider-specific headers and payload ────────────────────
        if provider_id == "anthropic":
            headers = {
                "x-api-key": decrypted_key or "",
                "anthropic-version": _ANTHROPIC_VERSION,
                "Content-Type": "application/json",
            }
            # Transform OpenAI chat completions → Anthropic Messages format
            final_payload = self._to_anthropic_payload(payload)
        else:
            # All other providers use the OpenAI-compatible format
            headers = {
                "Authorization": f"Bearer {decrypted_key}",
                "Content-Type": "application/json",
            }
            final_payload = payload

        if stream and provider_id != "anthropic":
            return await self._stream_response(url, headers, final_payload, provider["name"])

        response = await self.client.post(url, headers=headers, json=final_payload)

        if response.status_code == 200:
            raw = response.json()
            # Normalize Anthropic response → OpenAI format so the caller always
            # receives a consistent shape regardless of provider
            if provider_id == "anthropic":
                return self._from_anthropic_response(raw, payload["model"])
            return raw

        raise HTTPException(
            status_code=response.status_code,
            detail=f"Provider {provider['name']} error: {response.text[:200]}",
        )

    # ──────────────────────────────────────────────────────────────────────────
    # Anthropic payload transform helpers
    # ──────────────────────────────────────────────────────────────────────────
    def _to_anthropic_payload(self, oai_payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Converts an OpenAI chat completions payload to Anthropic Messages format.
        Key differences:
          - system message becomes a top-level "system" field
          - max_tokens is required by Anthropic (no default)
          - stream flag is the same
        """
        messages = oai_payload.get("messages", [])
        system_prompt: Optional[str] = None
        non_system = []

        for msg in messages:
            if msg.get("role") == "system":
                content = msg.get("content", "")
                system_prompt = content if isinstance(content, str) else str(content)
            else:
                non_system.append({"role": msg["role"], "content": msg.get("content", "")})

        anthropic_payload: Dict[str, Any] = {
            "model": oai_payload["model"],
            "max_tokens": oai_payload.get("max_tokens") or 1024,
            "messages": non_system,
        }
        if system_prompt:
            anthropic_payload["system"] = system_prompt
        if oai_payload.get("stream"):
            anthropic_payload["stream"] = True
        if oai_payload.get("temperature") is not None:
            anthropic_payload["temperature"] = oai_payload["temperature"]

        return anthropic_payload

    def _from_anthropic_response(
        self, anthropic_resp: Dict[str, Any], model: str
    ) -> Dict[str, Any]:
        """Normalizes an Anthropic Messages response to the OpenAI shape."""
        content_blocks = anthropic_resp.get("content", [])
        text = ""
        for block in content_blocks:
            if isinstance(block, dict) and block.get("type") == "text":
                text += block.get("text", "")

        usage = anthropic_resp.get("usage", {})
        return {
            "id": anthropic_resp.get("id", f"chatcmpl-{uuid.uuid4().hex[:8]}"),
            "object": "chat.completion",
            "created": int(time.time()),
            "model": model,
            "choices": [{
                "index": 0,
                "message": {"role": "assistant", "content": text},
                "finish_reason": anthropic_resp.get("stop_reason", "stop"),
            }],
            "usage": {
                "prompt_tokens":     usage.get("input_tokens", 0),
                "completion_tokens": usage.get("output_tokens", 0),
                "total_tokens":      usage.get("input_tokens", 0) + usage.get("output_tokens", 0),
            },
        }

    # ──────────────────────────────────────────────────────────────────────────
    # Step 8: Store analytics
    # ──────────────────────────────────────────────────────────────────────────
    async def store_analytics(
        self,
        user_id: str,
        provider_name: str,
        model: str,
        latency_ms: float,
        status_code: int,
        prompt_tokens: int = 0,
        completion_tokens: int = 0,
        db: Optional[AsyncSession] = None,
    ) -> None:
        logger.info(
            f"[Step 8] user={user_id} provider={provider_name} model={model} "
            f"latency={latency_ms:.1f}ms status={status_code}"
        )
        if db is None or user_id == "usr_dev_default":
            return

        try:
            db.add(RequestAnalytics(
                user_id=user_id,
                provider_name=provider_name,
                model_name=model,
                latency_ms=round(latency_ms, 2),
                status_code=status_code,
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
            ))
            await db.commit()
        except Exception as exc:
            logger.error(f"[Step 8] Analytics write failed (non-fatal): {exc}")

    # ──────────────────────────────────────────────────────────────────────────
    # Step 9: Full pipeline orchestration
    # ──────────────────────────────────────────────────────────────────────────
    async def route_chat_completion(
        self,
        request: ChatCompletionRequest,
        auth_header: Optional[str] = None,
        db: Optional[AsyncSession] = None,
    ) -> Any:
        start_time = time.time()

        key_info   = await self.verify_api_key(auth_header, db)
        user_info  = await self.identify_user(key_info["user_id"], db)
        user_id    = user_info["user_id"]
        user_keys  = await self.fetch_user_provider_keys(user_id, db)

        supported_providers = self.check_model_support(request.model)
        provider_chain      = self.select_best_provider(supported_providers, user_keys, request.model)

        payload    = request.model_dump(exclude_none=True)
        last_error: Optional[str] = None

        for provider in provider_chain:
            try:
                result = await self.send_request_to_provider(
                    provider, payload, stream=bool(request.stream)
                )
                latency_ms = (time.time() - start_time) * 1000

                prompt_tokens = completion_tokens = 0
                if isinstance(result, dict):
                    usage = result.get("usage", {})
                    prompt_tokens     = usage.get("prompt_tokens", 0)
                    completion_tokens = usage.get("completion_tokens", 0)

                await self.store_analytics(
                    user_id=user_id,
                    provider_name=provider["name"],
                    model=request.model,
                    latency_ms=latency_ms,
                    status_code=200,
                    prompt_tokens=prompt_tokens,
                    completion_tokens=completion_tokens,
                    db=db,
                )
                return result

            except HTTPException:
                raise
            except Exception as exc:
                logger.warning(f"[Failover] {provider['name']} failed: {exc}")
                last_error = str(exc)

        latency_ms = (time.time() - start_time) * 1000
        await self.store_analytics(
            user_id=user_id,
            provider_name="ALL_FAILED",
            model=request.model,
            latency_ms=latency_ms,
            status_code=502,
            db=db,
        )
        raise HTTPException(
            status_code=502,
            detail=f"All routed providers failed. Last error: {last_error}",
        )

    # ──────────────────────────────────────────────────────────────────────────
    # Helpers
    # ──────────────────────────────────────────────────────────────────────────
    async def _stream_response(
        self,
        url: str,
        headers: Dict[str, str],
        payload: Dict[str, Any],
        provider_name: str,
    ) -> StreamingResponse:
        async def event_generator() -> AsyncGenerator[str, None]:
            try:
                async with self.client.stream("POST", url, headers=headers, json=payload) as resp:
                    if resp.status_code != 200:
                        body = await resp.aread()
                        logger.error(f"Stream error from {provider_name}: {body.decode()}")
                        yield f"data: {json.dumps({'error': f'Provider {provider_name} stream error'})}\n\n"
                        return
                    async for line in resp.aiter_lines():
                        if line:
                            yield f"{line}\n\n"
            except Exception as err:
                logger.error(f"Streaming error {provider_name}: {err}")
                yield f"data: {json.dumps({'error': str(err)})}\n\n"

        return StreamingResponse(event_generator(), media_type="text/event-stream")

    def _generate_mock_response(self, model_name: str) -> Dict[str, Any]:
        return {
            "id": f"chatcmpl-voltkey-{uuid.uuid4().hex[:8]}",
            "object": "chat.completion",
            "created": int(time.time()),
            "model": model_name,
            "choices": [{
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": (
                        f"⚡ VoltKey Gateway — Mock Response [Model: {model_name}]\n\n"
                        "No provider keys are configured. Add them in your .env or via the dashboard (BYOK)."
                    ),
                },
                "finish_reason": "stop",
            }],
            "usage": {"prompt_tokens": 5, "completion_tokens": 20, "total_tokens": 25},
        }


router_engine = LLMRouter()
