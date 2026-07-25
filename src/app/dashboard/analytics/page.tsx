"use client";

import { useEffect, useState } from "react";
import { analyticsApi, type AnalyticsRow, type AnalyticsSummary } from "@/lib/api";

const STATUS_COLOR: Record<number, string> = {
  200: "#4ade80",
  429: "#facc15",
  502: "#f87171",
};

function statusColor(code: number) {
  return STATUS_COLOR[code] ?? "#87868C";
}

const WINDOWS = [
  { label: "7d",  days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

export default function AnalyticsPage() {
  const [rows, setRows] = useState<AnalyticsRow[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    setLoading(true);
    Promise.all([analyticsApi.list(days), analyticsApi.summary(days)])
      .then(([r, s]) => { setRows(r); setSummary(s); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [days]);

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <p className="font-display uppercase tracking-widest text-volt" style={{ fontSize: "10px", letterSpacing: "0.1em" }}>Analytics</p>
          <h1 className="font-serif text-primary" style={{ fontSize: "28px" }}>Request history</h1>
        </div>
        <div className="flex gap-1" style={{ border: "1px solid #28282D", borderRadius: "2px", overflow: "hidden" }}>
          {WINDOWS.map((w) => (
            <button
              key={w.days}
              onClick={() => setDays(w.days)}
              className="font-mono px-3 py-1.5 transition-colors"
              style={{
                fontSize: "12px",
                background: days === w.days ? "#E8A33D" : "#131316",
                color: days === w.days ? "#0A0A0B" : "#87868C",
              }}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary row */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px" style={{ background: "#28282D", border: "1px solid #28282D", borderRadius: "2px", overflow: "hidden" }}>
          {[
            { label: "Total", value: summary.total_requests },
            { label: "Successful", value: summary.successful_requests, color: "#4ade80" },
            { label: "Failed", value: summary.failed_requests, color: summary.failed_requests > 0 ? "#f87171" : "#87868C" },
            { label: "Avg Latency", value: `${Math.round(summary.avg_latency_ms)}ms` },
          ].map(({ label, value, color }) => (
            <div key={label} className="p-4" style={{ background: "#131316" }}>
              <p className="font-display uppercase tracking-widest text-muted mb-1" style={{ fontSize: "9px", letterSpacing: "0.1em" }}>{label}</p>
              <p className="font-mono font-bold" style={{ fontSize: "22px", color: color ?? "#EDEAE1" }}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Request log */}
      {loading ? (
        <p className="font-mono text-muted" style={{ fontSize: "13px" }}>Loading...</p>
      ) : rows.length === 0 ? (
        <div className="p-8 text-center" style={{ border: "1px dashed #28282D", borderRadius: "2px" }}>
          <p className="font-mono text-muted" style={{ fontSize: "13px" }}>No requests in this window yet.</p>
        </div>
      ) : (
        <div style={{ border: "1px solid #28282D", borderRadius: "2px", overflow: "hidden" }}>
          {/* Table header */}
          <div
            className="grid px-4 py-2.5 font-mono text-muted"
            style={{ fontSize: "10px", letterSpacing: "0.06em", background: "#0A0A0B", gridTemplateColumns: "1fr 1fr 80px 80px 100px" }}
          >
            <span>PROVIDER</span>
            <span>MODEL</span>
            <span>STATUS</span>
            <span>LATENCY</span>
            <span>TIME</span>
          </div>

          {rows.slice(0, 100).map((row, i) => (
            <div
              key={row.id}
              className="grid items-center px-4 py-3 font-mono"
              style={{
                fontSize: "12px",
                gridTemplateColumns: "1fr 1fr 80px 80px 100px",
                borderTop: "1px solid #28282D",
                background: i % 2 === 0 ? "#131316" : "#0A0A0B",
              }}
            >
              <span className="text-primary truncate">{row.provider_name}</span>
              <span className="text-muted truncate">{row.model_name}</span>
              <span style={{ color: statusColor(row.status_code) }}>{row.status_code}</span>
              <span className="text-muted">{Math.round(row.latency_ms)}ms</span>
              <span className="text-muted" style={{ fontSize: "11px" }}>
                {new Date(row.created_at).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Model breakdown */}
      {summary && Object.keys(summary.requests_by_model).length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="font-mono text-muted" style={{ fontSize: "11px", letterSpacing: "0.06em" }}>MODELS</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(summary.requests_by_model)
              .sort(([, a], [, b]) => b - a)
              .map(([model, count]) => (
                <span
                  key={model}
                  className="font-mono"
                  style={{ fontSize: "12px", color: "#87868C", padding: "3px 8px", background: "#131316", border: "1px solid #28282D", borderRadius: "2px" }}
                >
                  {model} <span style={{ color: "#E8A33D" }}>{count}</span>
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
