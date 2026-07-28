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
        db_url = settings.DATABASE_URL
        if not db_url or "xxxx" in db_url or "YOUR-PASSWORD" in db_url:
            logger.info("DATABASE_URL is placeholder/empty — falling back to local SQLite database (sqlite+aiosqlite:///./voltkey.db)")
            db_url = "sqlite+aiosqlite:///./voltkey.db"

        connect_args = {}
        if db_url.startswith("postgresql"):
            connect_args = {"ssl": "require"}

        try:
            _engine = create_async_engine(
                db_url,
                echo=settings.DB_ECHO,
                pool_pre_ping=True,
                connect_args=connect_args,
            )
        except Exception as exc:
            logger.warning(f"Failed to create primary DB engine ({exc}) — falling back to local SQLite")
            _engine = create_async_engine(
                "sqlite+aiosqlite:///./voltkey.db",
                echo=False,
                pool_pre_ping=True,
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
