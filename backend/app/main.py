import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.v1 import analytics, chat, health, keys, provider_keys, users
from app import db as _db_module
from app.services.router import router_engine

logger = logging.getLogger("voltkey.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown hook — clean up connections on exit."""
    logger.info("⚡ VoltKey starting up")
    yield
    logger.info("VoltKey shutting down — closing connections")
    # Close httpx client pool
    await router_engine.client.aclose()
    # Dispose SQLAlchemy async engine (if it was ever created)
    engine = _db_module.database._engine
    if engine is not None:
        await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="VoltKey — Unified LLM Gateway. One key, every model.",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# NOTE: allow_origins=["*"] + allow_credentials=True is rejected by every
# browser. We use explicit origins from config instead.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
