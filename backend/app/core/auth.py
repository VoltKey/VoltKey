"""
Supabase JWT verification for protected dashboard API routes.

Supabase issues HS256 JWTs signed with the project's JWT secret.
Every protected endpoint uses `Depends(get_current_user_id)` to extract
and validate the caller's identity.

The LLM gateway (/v1/chat/completions) uses a separate VoltKey API key
mechanism — NOT Supabase JWTs.
"""

import logging
from typing import Any, Dict, Optional

from fastapi import Depends, Header, HTTPException, status
from jose import ExpiredSignatureError, JWTError, jwt

from app.config import settings

logger = logging.getLogger("voltkey.auth")


def _extract_bearer(authorization: Optional[str]) -> str:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
        )
    if authorization.startswith("Bearer "):
        return authorization[7:].strip()
    return authorization.strip()


def verify_supabase_token(
    authorization: Optional[str] = Header(None),
) -> Dict[str, Any]:
    """
    FastAPI dependency — verifies a Supabase JWT and returns the full payload.

    Raises 401 if missing / invalid, 403 if the role is not 'authenticated'.
    """
    token = _extract_bearer(authorization)

    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
            options={"verify_exp": True},
        )
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired — please re-authenticate",
        )
    except JWTError as exc:
        logger.warning(f"JWT verification failed: {exc}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    if payload.get("role") != "authenticated":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Token role is not 'authenticated'",
        )

    return payload


def get_current_user_id(
    payload: Dict[str, Any] = Depends(verify_supabase_token),
) -> str:
    """
    FastAPI dependency — returns the caller's Supabase user UUID (sub claim).
    Compose with get_db for any protected route:
        user_id: str = Depends(get_current_user_id)
        db: AsyncSession = Depends(get_db)
    """
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is missing subject claim",
        )
    return user_id
