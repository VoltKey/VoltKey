import { createClient } from "@/lib/supabase/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function getSummary(token: string) {
  try {
    const res = await fetch(`${API_URL}/api/analytics/summary?days=30`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getKeyCount(token: string) {
  try {
    const res = await fetch(`${API_URL}/api/keys`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 60 },
    });
    if (!res.ok) return 0;
    const data = await res.json();
    return Array.isArray(data) ? data.length : 0;
  } catch {
    return 0;
  }
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div
      className="p-5 flex flex-col gap-2"
      style={{ background: "#131316", border: "1px solid #28282D", borderRadius: "2px" }}
    >
      <p className="font-display uppercase tracking-widest text-muted" style={{ fontSize: "10px", letterSpacing: "0.1em" }}>
        {label}
      </p>
      <p className="font-mono text-primary font-bold" style={{ fontSize: "26px" }}>
        {value}
      </p>
      {sub && (
        <p className="font-mono text-muted" style={{ fontSize: "12px" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? "";

  const [summary, keyCount] = await Promise.all([
    getSummary(token),
    getKeyCount(token),
  ]);

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <p className="font-display uppercase tracking-widest text-volt" style={{ fontSize: "10px", letterSpacing: "0.1em" }}>
          Dashboard
        </p>
        <h1 className="font-serif text-primary" style={{ fontSize: "28px" }}>
          Overview
        </h1>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px" style={{ background: "#28282D", border: "1px solid #28282D", borderRadius: "2px", overflow: "hidden" }}>
        <StatCard
          label="Requests (30d)"
          value={summary?.total_requests ?? 0}
          sub={`${summary?.successful_requests ?? 0} successful`}
        />
        <StatCard
          label="Avg Latency"
          value={summary ? `${Math.round(summary.avg_latency_ms)}ms` : "—"}
          sub="across all providers"
        />
        <StatCard
          label="Active Keys"
          value={keyCount}
          sub="VoltKey API keys"
        />
        <StatCard
          label="Tokens Used"
          value={
            summary
              ? `${((summary.total_prompt_tokens + summary.total_completion_tokens) / 1000).toFixed(1)}k`
              : "—"
          }
          sub="prompt + completion"
        />
      </div>

      {/* Provider breakdown */}
      {summary?.requests_by_provider && Object.keys(summary.requests_by_provider).length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="font-mono text-muted" style={{ fontSize: "12px", letterSpacing: "0.06em" }}>
            REQUESTS BY PROVIDER — LAST 30 DAYS
          </h2>
          <div
            className="divide-y"
            style={{ border: "1px solid #28282D", borderRadius: "2px" }}
          >
            {Object.entries(summary.requests_by_provider as Record<string, number>)
              .sort(([, a], [, b]) => b - a)
              .map(([provider, count]) => {
                const total = summary.total_requests as number;
                const pct = total ? Math.round((count / total) * 100) : 0;
                return (
                  <div
                    key={provider}
                    className="flex items-center justify-between px-4 py-3"
                    style={{ borderColor: "#28282D" }}
                  >
                    <span className="font-mono text-primary" style={{ fontSize: "13px" }}>
                      {provider}
                    </span>
                    <div className="flex items-center gap-4">
                      <div
                        className="h-1 rounded-none"
                        style={{ width: `${Math.max(pct, 2)}px`, background: "#E8A33D", opacity: 0.7 }}
                      />
                      <span className="font-mono text-muted" style={{ fontSize: "13px", minWidth: "48px", textAlign: "right" }}>
                        {count}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { label: "Generate API key", href: "/dashboard/keys", hint: "Create a new VoltKey API key for your app" },
          { label: "Add provider key", href: "/dashboard/providers", hint: "Bring your own OpenAI / Groq / Anthropic key" },
        ].map(({ label, href, hint }) => (
          <a
            key={href}
            href={href}
            className="flex flex-col gap-1.5 p-4 hover:border-volt transition-colors duration-200"
            style={{ background: "#131316", border: "1px solid #28282D", borderRadius: "2px" }}
          >
            <span className="font-mono text-volt" style={{ fontSize: "13px" }}>
              {label} →
            </span>
            <span className="font-mono text-muted" style={{ fontSize: "12px" }}>
              {hint}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
