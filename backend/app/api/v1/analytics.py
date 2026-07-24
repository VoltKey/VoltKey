"""
Analytics read endpoints — request history, latency stats, token usage.
"""

from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user_id
from app.db.database import get_db
from app.db.models import RequestAnalytics

router = APIRouter()


# ── Pydantic schemas ──────────────────────────────────────────────────────────

class AnalyticsRow(BaseModel):
    id: int
    provider_name: str
    model_name: str
    latency_ms: float
    status_code: int
    prompt_tokens: int
    completion_tokens: int
    created_at: datetime


class AnalyticsSummary(BaseModel):
    total_requests: int
    successful_requests: int
    failed_requests: int
    avg_latency_ms: float
    total_prompt_tokens: int
    total_completion_tokens: int
    requests_by_provider: dict[str, int]
    requests_by_model: dict[str, int]


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/analytics", response_model=List[AnalyticsRow])
async def get_analytics(
    limit: int = Query(default=50, le=500),
    offset: int = Query(default=0, ge=0),
    days: Optional[int] = Query(default=7, description="Look-back window in days"),
    provider: Optional[str] = Query(default=None),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Paginated request history for the authenticated user."""
    q = (
        select(RequestAnalytics)
        .where(RequestAnalytics.user_id == user_id)
        .order_by(RequestAnalytics.created_at.desc())
    )

    if days:
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        q = q.where(RequestAnalytics.created_at >= cutoff)
    if provider:
        q = q.where(RequestAnalytics.provider_name.ilike(provider))

    q = q.offset(offset).limit(limit)
    result = await db.execute(q)
    rows = result.scalars().all()

    return [
        AnalyticsRow(
            id=r.id,
            provider_name=r.provider_name,
            model_name=r.model_name,
            latency_ms=r.latency_ms,
            status_code=r.status_code,
            prompt_tokens=r.prompt_tokens,
            completion_tokens=r.completion_tokens,
            created_at=r.created_at,
        )
        for r in rows
    ]


@router.get("/analytics/summary", response_model=AnalyticsSummary)
async def get_analytics_summary(
    days: int = Query(default=30),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Aggregate stats over the requested time window."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)

    result = await db.execute(
        select(RequestAnalytics).where(
            RequestAnalytics.user_id == user_id,
            RequestAnalytics.created_at >= cutoff,
        )
    )
    rows = result.scalars().all()

    if not rows:
        return AnalyticsSummary(
            total_requests=0,
            successful_requests=0,
            failed_requests=0,
            avg_latency_ms=0.0,
            total_prompt_tokens=0,
            total_completion_tokens=0,
            requests_by_provider={},
            requests_by_model={},
        )

    successful = [r for r in rows if r.status_code == 200]
    by_provider: dict[str, int] = {}
    by_model: dict[str, int] = {}

    for r in rows:
        by_provider[r.provider_name] = by_provider.get(r.provider_name, 0) + 1
        by_model[r.model_name] = by_model.get(r.model_name, 0) + 1

    avg_latency = sum(r.latency_ms for r in rows) / len(rows)

    return AnalyticsSummary(
        total_requests=len(rows),
        successful_requests=len(successful),
        failed_requests=len(rows) - len(successful),
        avg_latency_ms=round(avg_latency, 2),
        total_prompt_tokens=sum(r.prompt_tokens for r in rows),
        total_completion_tokens=sum(r.completion_tokens for r in rows),
        requests_by_provider=by_provider,
        requests_by_model=by_model,
    )
