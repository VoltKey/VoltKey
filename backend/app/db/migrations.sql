-- =============================================================================
-- VoltKey — Supabase PostgreSQL Migration
-- Run this in: Supabase Dashboard → SQL Editor
-- =============================================================================

-- ─── 1. Users table ───────────────────────────────────────────────────────────
-- id mirrors auth.users.id (UUID) from Supabase Auth
CREATE TABLE IF NOT EXISTS public.users (
    id          VARCHAR(64)  PRIMARY KEY,
    email       VARCHAR(255) UNIQUE NOT NULL,
    plan_name   VARCHAR(50)  NOT NULL DEFAULT 'developer',
    rate_limit_rpm INT        NOT NULL DEFAULT 600,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── 2. VoltKey API Keys table ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.api_keys (
    id          VARCHAR(64)  PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id     VARCHAR(64)  NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    key_hash    VARCHAR(64)  UNIQUE NOT NULL, -- SHA-256 of the raw "vk_live_xxx" key
    name        VARCHAR(100) NOT NULL DEFAULT 'Default Key',
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── 3. User BYOK Provider Keys table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_provider_keys (
    id            VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id       VARCHAR(64) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    provider_name VARCHAR(50) NOT NULL,   -- 'openai' | 'groq' | 'anthropic' | 'gemini'
    encrypted_key TEXT        NOT NULL,   -- Fernet ciphertext
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, provider_name)
);

-- ─── 4. Request Analytics / Logs table ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.request_analytics (
    id                SERIAL      PRIMARY KEY,
    user_id           VARCHAR(64) REFERENCES public.users(id) ON DELETE SET NULL,
    provider_name     VARCHAR(50) NOT NULL,
    model_name        VARCHAR(100) NOT NULL,
    latency_ms        FLOAT       NOT NULL,
    status_code       INT         NOT NULL,
    prompt_tokens     INT         NOT NULL DEFAULT 0,
    completion_tokens INT         NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id       ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash          ON public.api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_provider_keys_user_id  ON public.user_provider_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id      ON public.request_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at   ON public.request_analytics(created_at DESC);

-- ─── Row Level Security ───────────────────────────────────────────────────────
-- Enable RLS (the FastAPI backend connects with the service role and bypasses
-- RLS, but it's good hygiene if you ever use the Supabase anon client directly)
ALTER TABLE public.users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_provider_keys  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_analytics   ENABLE ROW LEVEL SECURITY;

-- Users can only see their own row
CREATE POLICY "users_self"
    ON public.users FOR ALL
    USING (auth.uid()::text = id);

CREATE POLICY "api_keys_owner"
    ON public.api_keys FOR ALL
    USING (auth.uid()::text = user_id);

CREATE POLICY "provider_keys_owner"
    ON public.user_provider_keys FOR ALL
    USING (auth.uid()::text = user_id);

CREATE POLICY "analytics_owner"
    ON public.request_analytics FOR ALL
    USING (auth.uid()::text = user_id);

-- ─── Trigger: auto-create public.users on Supabase Auth signup ───────────────
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, plan_name, rate_limit_rpm, created_at)
  VALUES (
    NEW.id::text,
    NEW.email,
    'developer',
    600,
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
