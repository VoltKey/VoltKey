import os
from dotenv import load_dotenv, set_key

# Explicit path to backend/.env — relative to this file (backend/app/config.py)
_ENV_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))

load_dotenv(_ENV_FILE)


def _fix_db_url(url: str) -> str:
    """Convert a standard Supabase postgres:// URL to the asyncpg driver format."""
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+asyncpg://", 1)
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url


def _auto_generate_fernet_key() -> str:
    """
    Called exactly once when ENCRYPTION_SECRET_KEY is absent.
    Generates a Fernet key, writes it to backend/.env, and returns it
    so the running process has it immediately without a restart.
    """
    from cryptography.fernet import Fernet

    key = Fernet.generate_key().decode()
    set_key(_ENV_FILE, "ENCRYPTION_SECRET_KEY", key)
    os.environ["ENCRYPTION_SECRET_KEY"] = key

    print("\n⚡ [VoltKey] ENCRYPTION_SECRET_KEY was not set.")
    print(f"   Generated a new Fernet key and saved it to:\n   {_ENV_FILE}")
    print("   This key encrypts BYOK provider keys at rest — keep the .env file safe.\n")

    return key


class Settings:
    PROJECT_NAME: str = "VoltKey Backend"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/v1"

    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    # ── Database ───────────────────────────────────────────────────────────────
    DATABASE_URL: str = _fix_db_url(os.getenv("DATABASE_URL", ""))
    DB_ECHO: bool = os.getenv("DB_ECHO", "false").lower() == "true"

    # ── Supabase Auth ──────────────────────────────────────────────────────────
    # SUPABASE_JWT_SECRET is used by the backend to verify dashboard JWTs.
    # SUPABASE_URL / SUPABASE_ANON_KEY are used by the frontend only.
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")

    # ── Encryption — auto-generated on first run if missing ───────────────────
    ENCRYPTION_SECRET_KEY: str = (
        os.getenv("ENCRYPTION_SECRET_KEY") or _auto_generate_fernet_key()
    )

    # ── Platform-level provider keys (fallback when user has no BYOK key) ─────
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    MISTRAL_API_KEY: str = os.getenv("MISTRAL_API_KEY", "")
    TOGETHER_API_KEY: str = os.getenv("TOGETHER_API_KEY", "")

    # ── Provider base URLs ─────────────────────────────────────────────────────
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"
    # Anthropic native Messages API (NOT OpenAI-compatible — requires custom headers + payload)
    ANTHROPIC_BASE_URL: str = "https://api.anthropic.com/v1"
    # Gemini OpenAI-compatible endpoint
    GEMINI_BASE_URL: str = "https://generativelanguage.googleapis.com/v1beta/openai"
    # Mistral OpenAI-compatible endpoint
    MISTRAL_BASE_URL: str = "https://api.mistral.ai/v1"
    # Together AI OpenAI-compatible endpoint
    TOGETHER_BASE_URL: str = "https://api.together.xyz/v1"

    # ── CORS allowed origins ───────────────────────────────────────────────────
    # Comma-separated list. Override in .env for production.
    # Example: CORS_ORIGINS=https://yourdomain.com
    CORS_ORIGINS: list[str] = [
        o.strip()
        for o in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000",
        ).split(",")
        if o.strip()
    ]


settings = Settings()
