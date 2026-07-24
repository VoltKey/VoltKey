from fastapi import APIRouter, Header, Request, Depends
from typing import Optional

from app.schemas.chat import ChatCompletionRequest
from app.services.router import router_engine

router = APIRouter()

@router.post("/chat/completions")
async def chat_completions(
    request_body: ChatCompletionRequest,
    authorization: Optional[str] = Header(None)
):
    """
    OpenAI-compatible Chat Completions gateway endpoint.
    Routes requests intelligently across provider backends with automatic failover.
    """
    return await router_engine.route_chat_completion(
        request=request_body,
        auth_header=authorization
    )
