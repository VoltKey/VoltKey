/**
 * Typed helper for authenticated calls to the VoltKey backend.
 * Attaches the Supabase session token as a Bearer header.
 */
import { createClient } from "@/lib/supabase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function getAuthHeaders(): Promise<HeadersInit> {
  let token: string | undefined;

  try {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    token = session?.access_token;
  } catch {
    // Ignore client getSession error
  }

  if (!token) {
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        token = data.access_token;
      }
    } catch {
      // Ignore fetch error
    }
  }

  if (!token) {
    throw new Error("No active session — please sign in.");
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const headers = await getAuthHeaders();
  let res: Response;

  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err: any) {
    throw new Error(
      err?.message || `Failed to connect to VoltKey backend at ${API_URL}`
    );
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? `API error ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── API key management ────────────────────────────────────────────────────────
export const keysApi = {
  list: () => request<ApiKeyRecord[]>("GET", "/api/keys"),
  create: (name: string) =>
    request<CreatedKeyRecord>("POST", "/api/keys", { name }),
  revoke: (id: string) => request<void>("DELETE", `/api/keys/${id}`),
};

// ── Provider key management ───────────────────────────────────────────────────
export const providerKeysApi = {
  list: () => request<ProviderKeyRecord[]>("GET", "/api/provider-keys"),
  upsert: (provider_name: string, api_key: string) =>
    request<ProviderKeyRecord>("POST", "/api/provider-keys", {
      provider_name,
      api_key,
    }),
  remove: (provider: string) =>
    request<void>("DELETE", `/api/provider-keys/${provider}`),
};

// ── Analytics ─────────────────────────────────────────────────────────────────
export const analyticsApi = {
  list: (days = 7) =>
    request<AnalyticsRow[]>("GET", `/api/analytics?days=${days}&limit=100`),
  summary: (days = 30) =>
    request<AnalyticsSummary>("GET", `/api/analytics/summary?days=${days}`),
};

// ── User ─────────────────────────────────────────────────────────────────────
export const usersApi = {
  sync: () => request<UserProfile>("POST", "/api/users/sync"),
  me: () => request<UserProfile>("GET", "/api/users/me"),
};

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ApiKeyRecord {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  display_hint: string;
}

export interface CreatedKeyRecord {
  id: string;
  name: string;
  created_at: string;
  key: string; // shown once
}

export interface ProviderKeyRecord {
  id: string;
  provider_name: string;
  created_at: string;
  is_set: boolean;
}

export interface AnalyticsRow {
  id: number;
  provider_name: string;
  model_name: string;
  latency_ms: number;
  status_code: number;
  prompt_tokens: number;
  completion_tokens: number;
  created_at: string;
}

export interface AnalyticsSummary {
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  avg_latency_ms: number;
  total_prompt_tokens: number;
  total_completion_tokens: number;
  requests_by_provider: Record<string, number>;
  requests_by_model: Record<string, number>;
}

export interface UserProfile {
  id: string;
  email: string;
  plan_name: string;
  rate_limit_rpm: number;
  created_at: string;
}
