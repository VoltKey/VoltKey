"""
BYOK (Bring Your Own Keys) — provider key management.
User-supplied provider API keys are Fernet-encrypted before storage.
"""

from datetime import datetime
from typing import List, Optional

from cryptography.fernet import Fernet
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.auth import get_current_user_id
from app.db.database import get_db
from app.db.models import User, UserProviderKey

router = APIRouter()

SUPPORTED_PROVIDERS = {"openai", "groq", "anthropic", "gemini", "mistral", "together"}


def _fernet() -> Fernet:
    if not settings.ENCRYPTION_SECRET_KEY:
        raise HTTPException(
            status_code=500,
            detail="Server encryption key is not configured (ENCRYPTION_SECRET_KEY).",
        )
    return Fernet(settings.ENCRYPTION_SECRET_KEY.encode())


# ── Pydantic schemas ──────────────────────────────────────────────────────────

class UpsertProviderKeyRequest(BaseModel):
    provider_name: str
    api_key: str  # plaintext — encrypted on arrival, never stored raw


class ProviderKeyResponse(BaseModel):
    id: str
    provider_name: str
    created_at: datetime
    is_set: bool = True  # always true if the row exists


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/provider-keys", response_model=List[ProviderKeyResponse])
async def list_provider_keys(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Return which providers have a stored key (without revealing the key)."""
    result = await db.execute(
        select(UserProviderKey).where(UserProviderKey.user_id == user_id)
    )
    records = result.scalars().all()
    return [
        ProviderKeyResponse(id=r.id, provider_name=r.provider_name, created_at=r.created_at)
        for r in records
    ]


@router.post("/provider-keys", response_model=ProviderKeyResponse, status_code=status.HTTP_201_CREATED)
async def upsert_provider_key(
    body: UpsertProviderKeyRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Add or update a BYOK provider key.
    The supplied key is Fernet-encrypted before storage — only ciphertext is persisted.
    """
    provider = body.provider_name.lower()
    if provider not in SUPPORTED_PROVIDERS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported provider '{provider}'. Supported: {sorted(SUPPORTED_PROVIDERS)}",
        )

    # Ensure user record exists
    user_check = await db.execute(select(User).where(User.id == user_id))
    if not user_check.scalar_one_or_none():
        db.add(User(id=user_id, email=f"user_{user_id[:8]}@voltkey.internal", plan_name="developer", rate_limit_rpm=60))
        await db.flush()

    encrypted = _fernet().encrypt(body.api_key.encode()).decode()

    # Upsert — update if exists, insert if not
    result = await db.execute(
        select(UserProviderKey).where(
            UserProviderKey.user_id == user_id,
            UserProviderKey.provider_name == provider,
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        existing.encrypted_key = encrypted
        await db.commit()
        await db.refresh(existing)
        return ProviderKeyResponse(
            id=existing.id, provider_name=existing.provider_name, created_at=existing.created_at
        )

    new_key = UserProviderKey(
        user_id=user_id,
        provider_name=provider,
        encrypted_key=encrypted,
    )
    db.add(new_key)
    await db.commit()
    await db.refresh(new_key)

    return ProviderKeyResponse(
        id=new_key.id, provider_name=new_key.provider_name, created_at=new_key.created_at
    )


@router.delete("/provider-keys/{provider_name}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_provider_key(
    provider_name: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Remove a stored BYOK key for a given provider."""
    result = await db.execute(
        select(UserProviderKey).where(
            UserProviderKey.user_id == user_id,
            UserProviderKey.provider_name == provider_name.lower(),
        )
    )
    record = result.scalar_one_or_none()

    if not record:
        raise HTTPException(status_code=404, detail="Provider key not found")

    await db.delete(record)
    await db.commit()
