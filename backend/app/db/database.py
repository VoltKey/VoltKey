"""
Async SQLAlchemy engine + session factory wired to Supabase PostgreSQL.

The engine is created lazily on first use so that the module can be imported
safely even before DATABASE_URL is set (e.g. during tests or type-checking).
"""

import logging
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

logger = logging.getLogger("voltkey.db")

_engine = None
_session_factory = None


def _get_engine():
    global _engine
    if _engine is None:
        if not settings.DATABASE_URL:
            raise RuntimeError(
                "DATABASE_URL is not set. Add it to backend/.env "
                "(see backend/.env.example for the format)."
            )
        _engine = create_async_engine(
            settings.DATABASE_URL,
            echo=settings.DB_ECHO,
            pool_pre_ping=True,
            pool_size=5,
            max_overflow=10,
            connect_args={"ssl": "require"},
        )
    return _engine


def _get_session_factory():
    global _session_factory
    if _session_factory is None:
        _session_factory = async_sessionmaker(
            _get_engine(),
            class_=AsyncSession,
            expire_on_commit=False,
        )
    return _session_factory


class Base(DeclarativeBase):
    """Shared declarative base for all ORM models."""
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency — yields an async DB session, rolls back on error.
    Usage: db: AsyncSession = Depends(get_db)
    """
    async with _get_session_factory()() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
