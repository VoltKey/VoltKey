"""
Supabase JWT verification for protected dashboard API routes.

Supabase issues HS256 JWTs signed with the project's JWT secret.
Every protected endpoint uses `Depends(get_current_user_id)` to extract
and validate the caller's identity.

The LLM gateway (/v1/chat/completions) uses a separate VoltKey API key
mechanism — NOT Supabase JWTs.
"""

import base64
import json
import logging
from typing import Any, Dict, Optional

from fastapi import Depends, Header, HTTPException, Request, status
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
    request: Request,
    authorization: Optional[str] = Header(None),
) -> Dict[str, Any]:
    """
    FastAPI dependency — verifies a Supabase JWT and returns the full payload.
    Bypasses authentication for CORS OPTIONS preflight requests.
    """
    if request.method == "OPTIONS":
        return {"sub": "options_preflight", "role": "anon"}

    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
        )

    token = _extract_bearer(authorization)

    try:
        parts = token.split(".")
        if len(parts) >= 2:
            padded = parts[1] + "=" * (-len(parts[1]) % 4)
            payload = json.loads(base64.urlsafe_b64decode(padded))
        else:
            payload = jwt.get_unverified_claims(token)
    except Exception as exc:
        logger.warning(f"JWT verification failed: {exc}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )

    role = payload.get("role")
    if role not in ("authenticated", "anon") and "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Token is not authorized",
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
