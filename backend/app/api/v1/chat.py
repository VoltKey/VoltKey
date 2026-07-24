from typing import Optional

from fastapi import APIRouter, Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas.chat import ChatCompletionRequest
from app.services.router import router_engine

router = APIRouter()

@router.post("/chat/completions")
async def chat_completions(
    request_body: ChatCompletionRequest,
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
):
    """
    OpenAI-compatible Chat Completions gateway endpoint.
    Auth: VoltKey API key (Bearer vk_live_xxx) — NOT a Supabase JWT.
    Automatically routes across providers with failover.
    """
    return await router_engine.route_chat_completion(
        request=request_body,
        auth_header=authorization,
        db=db,
    )
