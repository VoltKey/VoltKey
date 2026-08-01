# ⚡ VoltKey — Unified LLM Gateway

> **One key. Every model. Never waiting on a limit.**  
> Route across free tiers and your own provider keys with automatic failover, zero prompt logging, and an OpenAI-compatible API.

---

## 🌟 Why VoltKey?

Every developer deserves access to the best AI models without juggling five dashboards, five API keys, and five billing pages. **VoltKey** acts as an intelligent pass-through router for LLMs:

- ⚡ **Developer-First**: One unified API key (`vk_live_...`) and zero complexity.
- 🔄 **Intelligent Routing & Failover**: Automatic failover and latency-aware selection across **OpenAI, Groq, Anthropic, Gemini, Mistral, and Together AI**. If a provider rate-limits (HTTP 429) or fails, VoltKey reroutes your request to the next healthy provider within the same call.
- 🔐 **Zero Data Logging**: We route your requests; we don't read them. No prompt logging, no response caching, and no training data collection.
- 🛡️ **Key Isolation & Encryption**: Bring Your Own Keys (BYOK). Your provider credentials are encrypted at rest with **AES-256 (Fernet)** in isolated per-user vaults and decrypted in-memory only at request time.
- 🔌 **100% OpenAI Compatible**: Drop-in replacement for the official OpenAI SDKs, LangChain, LlamaIndex, or any tool speaking the `/v1/chat/completions` protocol.

---

## 🏗️ Architecture & Tech Stack

VoltKey is built with a decoupled frontend and backend architecture designed for high throughput and security:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Client Applications                            │
│           (OpenAI SDK, LangChain, cURL, Custom Apps)                    │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Auth: Bearer vk_live_...
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      FastAPI Backend (Python 3.14+)                     │
│  ├── /v1/chat/completions ──► Router Engine (Failover & Retry Loop)     │
│  ├── /api/*              ──► Dashboard Management API                   │
│  └── InMemory Rate Limiter & Fernet AES-256 Key Vault                   │
└──────────┬───────────────────────────────────────────────────┬──────────┘
           │ AsyncIO (asyncpg)                                 │ HTTPX Async Pool
           ▼                                                   ▼
┌─────────────────────────────────────┐      ┌────────────────────────────┐
│      Supabase PostgreSQL DB         │      │      AI Model Providers    │
│  (Transaction Pooler Mode @ 6543)   │      │  OpenAI · Groq · Anthropic │
│  Users, Keys, Provider Keys, Usage  │      │  Gemini · Mistral · Together│
└─────────────────────────────────────┘      └────────────────────────────┘
```

### **Frontend**
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router) + [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/) + Custom PCB/circuit-trace aesthetics & dark theme
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) + [Lucide Icons](https://lucide.dev/)
- **Authentication**: [Supabase Auth](https://supabase.com/auth) (JWT-based session management)

### **Backend**
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.14+ Async API) + [Uvicorn](https://www.uvicorn.org/)
- **Database**: [SQLAlchemy 2.0 (AsyncIO)](https://docs.sqlalchemy.org/) + `asyncpg` driver configured for Supabase Transaction Pooler compatibility (`statement_cache_size=0`)
- **HTTP Client**: [HTTPX](https://www.python-httpx.org/) async client pool for ultra-low latency upstream model requests
- **Security**: [Cryptography (Fernet AES-256)](https://cryptography.io/) for credential encryption at rest

---

## 🚀 Quickstart

Integrating VoltKey into your existing app requires changing only **two lines of code**: your base URL and API key.

### **Python (OpenAI SDK)**

```bash
pip install openai
```

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://api.voltkey.dev/v1",  # Or http://localhost:8000/v1 locally
    api_key="vk_live_your_voltkey_api_key_here",
)

response = client.chat.completions.create(
    model="llama-3.1-8b-instant",  # Works with gpt-4o-mini, claude-3-5-sonnet, etc.
    messages=[
        {"role": "system", "content": "You are a concise assistant."},
        {"role": "user", "content": "Explain VoltKey in one sentence."},
    ],
)

print(response.choices[0].message.content)
```

### **Node.js / TypeScript (OpenAI SDK)**

```bash
npm install openai
```

```typescript
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.voltkey.dev/v1",
  apiKey: "vk_live_your_voltkey_api_key_here",
});

async function main() {
  const completion = await openai.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", "content": "Hello VoltKey!" }],
  });

  console.log(completion.choices[0].message.content);
}

main();
```

### **cURL**

```bash
curl -s https://api.voltkey.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer vk_live_your_voltkey_api_key_here" \
  -d '{
    "model": "llama-3.1-8b-instant",
    "messages": [
      {"role": "user", "content": "Hello world!"}
    ]
  }'
```

---

## 🛠️ Local Development Guide

### **Prerequisites**
- **Node.js** 20.x or higher (`npm` or `pnpm`)
- **Python** 3.11 or higher
- A **Supabase** project (for PostgreSQL database & User Auth)

---

### **1. Clone the Repository**

```bash
git clone https://github.com/VoltKey/VoltKey.git
cd VoltKey
```

---

### **2. Backend Setup**

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in `backend/.env` (see table below for required variables):
   ```bash
   cp .env.example .env
   ```
5. Run the development server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   - API Root: `http://localhost:8000`
   - Interactive OpenAPI Docs: `http://localhost:8000/docs`

---

### **3. Frontend Setup**

1. From the project root, install Node dependencies:
   ```bash
   npm install
   ```
2. Create a `.env.local` file in the project root:
   ```bash
   cp .env.example .env.local
   ```
3. Run the Next.js development server:
   ```bash
   npm run dev
   ```
   - Application URL: `http://localhost:3000`

---

## ⚙️ Environment Variables Reference

### **Frontend (`.env.local`)**

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anonymous/Public JWT Key | `eyJhbGciOiJIUzI1Ni...` |
| `NEXT_PUBLIC_API_URL` | URL of the running FastAPI backend | `http://localhost:8000` |

---

### **Backend (`backend/.env`)**

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | Supabase **Transaction Pooler** PostgreSQL connection URI (Port `6543`, remember to URL-encode `@` as `%40` in passwords) | `postgresql://postgres.xxx:password%40123@aws-0-xxxx.pooler.supabase.com:6543/postgres` |
| `SUPABASE_URL` | Your Supabase Project URL | `https://xxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Your Supabase Anonymous/Public JWT Key | `eyJhbGciOiJIUzI1Ni...` |
| `SUPABASE_JWT_SECRET` | Secret used to verify dashboard JWT signatures | `your-supabase-jwt-secret-from-dashboard` |
| `ENCRYPTION_SECRET_KEY` | 32-byte base64-encoded Fernet key to encrypt BYOK API keys at rest. Generated automatically on startup if omitted. | `Ix_oDr4JEZvNpsLg0aLn...` |
| `CORS_ORIGINS` | Comma-separated list of allowed frontend origins | `http://localhost:3000,https://voltkey.onrender.com` |
| `OPENAI_API_KEY` | *(Optional)* Default fallback OpenAI key | `sk-...` |
| `GROQ_API_KEY` | *(Optional)* Default fallback Groq key | `gsk_...` |
| `ANTHROPIC_API_KEY` | *(Optional)* Default fallback Anthropic key | `sk-ant-...` |
| `GEMINI_API_KEY` | *(Optional)* Default fallback Google Gemini key | `AIza...` |
| `MISTRAL_API_KEY` | *(Optional)* Default fallback Mistral key | `...` |
| `TOGETHER_API_KEY` | *(Optional)* Default fallback Together AI key | `...` |

> **Note on Database Connection Pooling**: VoltKey is configured to disable prepared statement caching (`statement_cache_size=0`) automatically for `postgresql://` URIs so that it works seamlessly with **Supabase PgBouncer / Transaction Poolers (port 6543)**.

---

## 🌐 Deployment Notes

### **1. Backend (Render / Railway / Fly.io)**
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Ensure `DATABASE_URL` uses the **Transaction Pooler (port 6543)** connection string.
- Add your frontend domain to `CORS_ORIGINS`.

### **2. Frontend (Vercel / Netlify)**
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- Set `NEXT_PUBLIC_API_URL` to your production backend URL (e.g., `https://voltkey-backend.onrender.com`).

---

## 🗺️ Supported Models & Providers

VoltKey routes requests dynamically across providers based on model name and provider availability:

| Provider | Supported Example Models | Base URL Endpoint |
| :--- | :--- | :--- |
| **Groq** | `llama-3.1-8b-instant`, `llama-3.3-70b-versatile`, `mixtral-8x7b-32768` | `https://api.groq.com/openai/v1` |
| **OpenAI** | `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`, `gpt-3.5-turbo` | `https://api.openai.com/v1` |
| **Anthropic** | `claude-3-5-sonnet-20241022`, `claude-3-haiku-20240307` | `https://api.anthropic.com/v1` |
| **Google Gemini**| `gemini-1.5-pro`, `gemini-2.0-flash` | `https://generativelanguage.googleapis.com/v1beta/openai` |
| **Mistral AI** | `mistral-large-latest`, `open-mixtral-8x22b` | `https://api.mistral.ai/v1` |
| **Together AI** | `meta-llama/Llama-3.3-70B-Instruct-Turbo` | `https://api.together.xyz/v1` |

---

## 🔒 Security & Privacy

1. **End-to-End Encryption**: All traffic is encrypted in transit using TLS 1.3. Provider API keys are encrypted at rest with AES-256 (Fernet) and never logged in plaintext.
2. **Zero Data Retention**: Your chat prompts and model completions are streamed directly to/from the provider and discarded from memory immediately after response transmission.
3. **Isolated Vaults**: No shared credential pools. Your BYOK credentials are tied exclusively to your account ID.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
