import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.v1 import analytics, chat, health, keys, provider_keys, users
from app import db as _db_module
from app.services.router import router_engine
from app.core.ratelimit import InMemoryRateLimiter

logger = logging.getLogger("voltkey.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown hook — clean up connections on exit."""
    logger.info("⚡ VoltKey starting up")

    try:
        engine = _db_module.database._get_engine()
        async with engine.begin() as conn:
            from app.db.models import Base
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables verified / created")
    except Exception as exc:
        logger.warning(f"Table creation skipped (non-fatal): {exc}")

    yield

    logger.info("VoltKey shutting down — closing connections")
    # Close httpx client pool
    await router_engine.client.aclose()
    # Dispose SQLAlchemy async engine (if created)
    if _db_module.database._engine is not None:
        await _db_module.database._engine.dispose()


_rate_limiter = InMemoryRateLimiter(max_requests=60, window_seconds=60)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="VoltKey — Unified LLM Gateway. One key, every model.",
    lifespan=lifespan,
)

# ── Rate limiting middleware ──────────────────────────────────────────────────
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    if request.url.path.startswith("/api/") or request.url.path.startswith("/v1/"):
        client_ip = request.client.host if request.client else "unknown"
        ok, retry_after = _rate_limiter.check(client_ip)
        if not ok:
            from fastapi.responses import JSONResponse
            return JSONResponse(
                status_code=429,
                content={"detail": f"Rate limit exceeded. Retry after {retry_after}s."},
                headers={"Retry-After": str(retry_after)},
            )
    return await call_next(request)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.vercel\.app|http://localhost:\d+|http://127\.0\.0\.1:\d+|https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import HTTPException
from fastapi.responses import JSONResponse

@app.exception_handler(HTTPException)
async def http_exception_cors_handler(request: Request, exc: HTTPException):
    origin = request.headers.get("origin", "*")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        },
    )

@app.exception_handler(Exception)
async def general_exception_cors_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    origin = request.headers.get("origin", "*")
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        },
    )

# ── Routers ───────────────────────────────────────────────────────────────────
# LLM gateway — authenticated with VoltKey API keys (Bearer vk_live_xxx)
app.include_router(health.router, tags=["Health"])
app.include_router(chat.router, prefix=settings.API_V1_STR, tags=["Chat"])

# Dashboard management API — authenticated with Supabase JWTs
app.include_router(keys.router,          prefix="/api", tags=["API Keys"])
app.include_router(provider_keys.router, prefix="/api", tags=["Provider Keys"])
app.include_router(analytics.router,     prefix="/api", tags=["Analytics"])
app.include_router(users.router,         prefix="/api", tags=["Users"])


@app.get("/")
async def root():
    return {
        "message": "⚡ VoltKey LLM Gateway",
        "docs":             "/docs",
        "health":           "/health",
        "chat_completions": f"{settings.API_V1_STR}/chat/completions",
        "api_keys":         "/api/keys",
        "provider_keys":    "/api/provider-keys",
        "analytics":        "/api/analytics",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
