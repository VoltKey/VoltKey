"""
VoltKey API Key management — protected by Supabase JWT.
Keys are stored as SHA-256 hashes; the raw key is returned once on creation.
"""

import hashlib
import secrets
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user_id
from app.db.database import get_db
from app.db.models import ApiKey

router = APIRouter()


# ── Pydantic schemas ──────────────────────────────────────────────────────────

class CreateKeyRequest(BaseModel):
    name: Optional[str] = "Default Key"


class ApiKeyResponse(BaseModel):
    id: str
    name: str
    is_active: bool
    created_at: datetime
    # Prefix for display — the raw key is never returned after creation
    display_hint: str  # e.g. "vk_live_a1b2c3..."


class CreatedKeyResponse(BaseModel):
    id: str
    name: str
    created_at: datetime
    # Full raw key shown exactly once — copy it now
    key: str


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/keys", response_model=List[ApiKeyResponse])
async def list_api_keys(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """List all active API keys for the authenticated user."""
    result = await db.execute(
        select(ApiKey).where(ApiKey.user_id == user_id, ApiKey.is_active == True)
        .order_by(ApiKey.created_at.desc())
    )
    keys = result.scalars().all()
    return [
        ApiKeyResponse(
            id=k.id,
            name=k.name,
            is_active=k.is_active,
            created_at=k.created_at,
            # Show only the prefix — the hash chars are not the key chars
            display_hint="vk_live_" + "•" * 16,
        )
        for k in keys
    ]


@router.post("/keys", response_model=CreatedKeyResponse, status_code=status.HTTP_201_CREATED)
async def create_api_key(
    body: CreateKeyRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Generate a new VoltKey API key.
    The full key is returned ONCE — it cannot be retrieved again.
    """
    raw_key = "vk_live_" + secrets.token_hex(16)  # vk_live_ + 32 hex chars
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()

    new_key = ApiKey(
        user_id=user_id,
        key_hash=key_hash,
        name=body.name or "Default Key",
    )
    db.add(new_key)
    await db.commit()
    await db.refresh(new_key)

    return CreatedKeyResponse(
        id=new_key.id,
        name=new_key.name,
        created_at=new_key.created_at,
        key=raw_key,
    )


@router.delete("/keys/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_api_key(
    key_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Revoke (soft-delete) an API key — sets is_active = False."""
    result = await db.execute(
        select(ApiKey).where(ApiKey.id == key_id, ApiKey.user_id == user_id)
    )
    key = result.scalar_one_or_none()

    if not key:
        raise HTTPException(status_code=404, detail="API key not found")
    if not key.is_active:
        raise HTTPException(status_code=409, detail="Key is already revoked")

    key.is_active = False
    await db.commit()
