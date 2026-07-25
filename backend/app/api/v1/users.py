"""
User account management.
`POST /api/users/sync` is called after frontend auth to ensure a public.users
row exists — the Supabase trigger handles first signup, but this is a safe fallback.
"""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user_id, verify_supabase_token
from app.db.database import get_db
from app.db.models import User

router = APIRouter()


# ── Pydantic schemas ──────────────────────────────────────────────────────────

class UserProfile(BaseModel):
    id: str
    email: str
    plan_name: str
    rate_limit_rpm: int
    created_at: datetime


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/users/sync", response_model=UserProfile)
async def sync_user(
    payload: dict = Depends(verify_supabase_token),
    db: AsyncSession = Depends(get_db),
):
    """
    Upsert a public.users row from the Supabase JWT payload.
    Safe to call on every login — idempotent via ON CONFLICT DO NOTHING pattern.
    """
    user_id: str = payload["sub"]
    email: str = payload.get("email") or ""

    if not email:
        raise HTTPException(
            status_code=422,
            detail="User account has no email address. VoltKey requires an email-based account.",
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if user:
        return UserProfile(
            id=user.id,
            email=user.email,
            plan_name=user.plan_name,
            rate_limit_rpm=user.rate_limit_rpm,
            created_at=user.created_at,
        )

    # First time — create the row
    new_user = User(id=user_id, email=email)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return UserProfile(
        id=new_user.id,
        email=new_user.email,
        plan_name=new_user.plan_name,
        rate_limit_rpm=new_user.rate_limit_rpm,
        created_at=new_user.created_at,
    )


@router.get("/users/me", response_model=UserProfile)
async def get_me(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Return the authenticated user's profile."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User profile not found — call /api/users/sync first.",
        )

    return UserProfile(
        id=user.id,
        email=user.email,
        plan_name=user.plan_name,
        rate_limit_rpm=user.rate_limit_rpm,
        created_at=user.created_at,
    )
