import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "VoltKey Backend"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/v1"
    
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # Provider keys
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Provider base URLs
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"
    ANTHROPIC_BASE_URL: str = "https://api.anthropic.com/v1"

settings = Settings()
