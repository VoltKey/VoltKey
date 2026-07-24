# VoltKey — Database Integration Guide

This guide explains how to integrate a Database (PostgreSQL, Supabase, SQLAlchemy, Prisma, etc.) into the **VoltKey LLM Gateway** backend ([backend/app/services/router.py](file:///Users/ritijraj/Desktop/VOLTKEY/backend/app/services/router.py)).

---

## 🗺️ Pipeline Database Touchpoint Map

VoltKey's 9-step pipeline architecture isolates all database touchpoints into 5 single-responsibility functions in `router.py`:

```
Step 1: verify_api_key()            ──► DB Query: Match API Key hash
Step 2: identify_user()             ──► DB Query: Fetch User & Rate Limits
Step 3: fetch_user_provider_keys()  ──► DB Query: Fetch User's BYOK Provider Keys
Step 6: decrypt_provider_key()      ──► KMS / Cipher: Decrypt stored secret key
Step 8: store_analytics()           ──► DB Insert: Save Request Metrics & Logs
```

---

## 🗄️ Recommended Database Schema (SQL)

Here is the recommended 4-table SQL schema to support user accounts, VoltKey API keys, BYOK provider secrets, and request analytics:

```sql
-- 1. Users Table
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    plan_name VARCHAR(50) DEFAULT 'developer',
    rate_limit_rpm INT DEFAULT 600,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. VoltKey API Keys Table
CREATE TABLE api_keys (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    key_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA-256 hash of vk_live_xxx
    name VARCHAR(100) DEFAULT 'Default Key',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. User Provider BYOK Keys Table
CREATE TABLE user_provider_keys (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    provider_name VARCHAR(50) NOT NULL,   -- 'openai', 'groq', 'anthropic', 'gemini'
    encrypted_key TEXT NOT NULL,           -- Ciphertext
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, provider_name)
);

-- 4. Analytics & Request Logs Table
CREATE TABLE request_analytics (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id),
    provider_name VARCHAR(50) NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    latency_ms FLOAT NOT NULL,
    status_code INT NOT NULL,
    prompt_tokens INT DEFAULT 0,
    completion_tokens INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🛠️ Step-by-Step Code Replacements in `router.py`

### 1. Step 1: Verify API Key ([router.py:L65](file:///Users/ritijraj/Desktop/VOLTKEY/backend/app/services/router.py#L65))

```python
import hashlib

async def verify_api_key(self, auth_header: Optional[str], db: AsyncSession) -> Dict[str, Any]:
    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing API key")
        
    token = auth_header.replace("Bearer ", "").strip()
    hashed_token = hashlib.sha256(token.encode()).hexdigest()
    
    # DB Query:
    # key_record = await db.query(ApiKey).filter(ApiKey.key_hash == hashed_token, ApiKey.is_active == True).first()
    if not key_record:
        raise HTTPException(status_code=401, detail="Invalid or revoked API key")
        
    return {"key": token, "is_valid": True, "user_id": key_record.user_id, "key_id": key_record.id}
```

---

### 2. Step 2: Identify User & Tier Limits ([router.py:L85](file:///Users/ritijraj/Desktop/VOLTKEY/backend/app/services/router.py#L85))

```python
async def identify_user(self, user_id: str, db: AsyncSession) -> Dict[str, Any]:
    # DB Query:
    # user = await db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {
        "user_id": user.id,
        "email": user.email,
        "tier": user.plan_name,
        "rate_limit_rpm": user.rate_limit_rpm
    }
```

---

### 3. Step 3: Fetch User Stored Keys (BYOK) ([router.py:L100](file:///Users/ritijraj/Desktop/VOLTKEY/backend/app/services/router.py#L100))

```python
async def fetch_user_provider_keys(self, user_id: str, db: AsyncSession) -> Dict[str, str]:
    # DB Query:
    # records = await db.query(UserProviderKey).filter(UserProviderKey.user_id == user_id).all()
    user_keys = {r.provider_name: r.encrypted_key for r in records}
    
    # Fallback to server platform keys if user hasn't added their own BYOK key
    return {
        "groq": user_keys.get("groq") or settings.GROQ_API_KEY,
        "openai": user_keys.get("openai") or settings.OPENAI_API_KEY,
        "anthropic": user_keys.get("anthropic") or settings.ANTHROPIC_API_KEY,
        "gemini": user_keys.get("gemini") or settings.GEMINI_API_KEY,
    }
```

---

### 4. Step 6: Decrypt Provider Key ([router.py:L189](file:///Users/ritijraj/Desktop/VOLTKEY/backend/app/services/router.py#L189))

```python
from cryptography.fernet import Fernet

fernet = Fernet(settings.ENCRYPTION_SECRET_KEY)

def decrypt_provider_key(self, encrypted_key: Optional[str]) -> Optional[str]:
    if not encrypted_key:
        return None
    if encrypted_key.startswith("gsk_") or encrypted_key.startswith("sk-"):
        return encrypted_key # Plaintext dev env key fallback
        
    return fernet.decrypt(encrypted_key.encode()).decode()
```

---

### 5. Step 8: Store Analytics Log ([router.py:L237](file:///Users/ritijraj/Desktop/VOLTKEY/backend/app/services/router.py#L237))

```python
async def store_analytics(
    self, 
    user_id: str, 
    provider_name: str, 
    model: str, 
    latency_ms: float, 
    status_code: int, 
    tokens_used: int = 0,
    db: Optional[AsyncSession] = None
):
    logger.info(f"[Analytics] User: {user_id} | Provider: {provider_name} | Latency: {latency_ms:.2f}ms")
    
    # DB Insert:
    # log_entry = RequestLog(
    #     user_id=user_id,
    #     provider=provider_name,
    #     model=model,
    #     latency_ms=latency_ms,
    #     status_code=status_code,
    #     tokens_used=tokens_used
    # )
    # db.add(log_entry)
    # await db.commit()
```

---

## 💡 Summary

Because `router.py` uses modular single-responsibility functions for each pipeline step, plugging in your database requires **zero changes to the core HTTP proxying or failover loop** — you only update the implementation of those 5 individual methods!
