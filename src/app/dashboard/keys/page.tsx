"use client";

import { useEffect, useState } from "react";
import { keysApi, type ApiKeyRecord, type CreatedKeyRecord } from "@/lib/api";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="font-mono text-muted hover:text-primary transition-colors"
      style={{ fontSize: "12px" }}
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

export default function KeysPage() {
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [createdKey, setCreatedKey] = useState<CreatedKeyRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    keysApi
      .list()
      .then(setKeys)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load keys"))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const result = await keysApi.create(newKeyName || "Default Key");
      setCreatedKey(result);
      setKeys((prev) => [{ id: result.id, name: result.name, is_active: true, created_at: result.created_at, display_hint: result.key.slice(0, 20) + "••••" }, ...prev]);
      setShowForm(false);
      setNewKeyName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create key");
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: string) {
    if (!confirm("Revoke this API key? Any apps using it will stop working immediately.")) return;
    try {
      await keysApi.revoke(id);
      setKeys((prev) => prev.filter((k) => k.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to revoke key");
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="font-display uppercase tracking-widest text-volt" style={{ fontSize: "10px", letterSpacing: "0.1em" }}>API Keys</p>
          <h1 className="font-serif text-primary" style={{ fontSize: "28px" }}>Your keys</h1>
          <p className="font-mono text-muted" style={{ fontSize: "13px" }}>Use these keys as your <code className="text-primary">api_key</code> in the OpenAI SDK.</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setCreatedKey(null); }}
          className="btn-volt font-mono font-bold px-4 py-2 shrink-0"
          style={{ fontSize: "13px" }}
        >
          + New key
        </button>
      </div>

      {error && !showForm && (
        <div className="p-4 font-mono text-sm" style={{ background: "rgba(255,90,90,0.1)", border: "1px solid rgba(255,90,90,0.3)", color: "#FF5A5A", borderRadius: "2px" }}>
          ⚠ {error}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="flex flex-col gap-4 p-5"
          style={{ background: "#131316", border: "1px solid rgba(232,163,61,0.3)", borderRadius: "2px" }}
        >
          <p className="font-mono text-primary" style={{ fontSize: "13px" }}>Name this key</p>
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="e.g. Production App"
            className="font-mono text-primary bg-void px-3 py-2 outline-none w-full"
            style={{ fontSize: "13px", border: "1px solid #28282D", borderRadius: "2px" }}
          />
          {error && <p className="font-mono text-sm" style={{ color: "rgba(255,90,90,0.9)" }}>{error}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={creating} className="btn-volt font-mono font-bold px-4 py-2" style={{ fontSize: "13px" }}>
              {creating ? "Creating..." : "Generate key"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost font-mono px-4 py-2" style={{ fontSize: "13px" }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* One-time key reveal */}
      {createdKey && (
        <div className="flex flex-col gap-3 p-5" style={{ background: "rgba(232,163,61,0.05)", border: "1px solid rgba(232,163,61,0.3)", borderRadius: "2px" }}>
          <p className="font-mono text-volt" style={{ fontSize: "12px", letterSpacing: "0.06em" }}>
            ⚡ COPY THIS KEY — IT WILL NOT BE SHOWN AGAIN
          </p>
          <div className="flex items-center gap-3">
            <code
              className="font-mono text-primary flex-1 px-3 py-2 select-all"
              style={{ fontSize: "13px", background: "#0A0A0B", border: "1px solid #28282D", borderRadius: "2px", wordBreak: "break-all" }}
            >
              {createdKey.key}
            </code>
            <CopyButton text={createdKey.key} />
          </div>
          <button onClick={() => setCreatedKey(null)} className="font-mono text-muted hover:text-primary transition-colors text-left" style={{ fontSize: "12px" }}>
            I&apos;ve saved it →
          </button>
        </div>
      )}

      {/* Key list */}
      {loading ? (
        <p className="font-mono text-muted" style={{ fontSize: "13px" }}>Loading...</p>
      ) : keys.length === 0 ? (
        <div className="p-8 text-center" style={{ border: "1px dashed #28282D", borderRadius: "2px" }}>
          <p className="font-mono text-muted" style={{ fontSize: "13px" }}>No API keys yet. Generate your first one above.</p>
        </div>
      ) : (
        <div style={{ border: "1px solid #28282D", borderRadius: "2px", overflow: "hidden" }}>
          {keys.map((key, i) => (
            <div
              key={key.id}
              className="flex items-center justify-between gap-4 px-4 py-4"
              style={{ borderTop: i > 0 ? "1px solid #28282D" : "none", background: "#131316" }}
            >
              <div className="flex flex-col gap-1 min-w-0">
                <span className="font-mono text-primary" style={{ fontSize: "13px" }}>{key.name}</span>
                <span className="font-mono text-muted" style={{ fontSize: "12px" }}>{key.display_hint}</span>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="font-mono text-muted" style={{ fontSize: "11px" }}>
                  {new Date(key.created_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleRevoke(key.id)}
                  className="font-mono text-muted hover:text-primary transition-colors"
                  style={{ fontSize: "12px" }}
                >
                  Revoke
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="p-4 font-mono text-muted" style={{ fontSize: "12px", lineHeight: "1.8", background: "#131316", border: "1px solid #28282D", borderRadius: "2px" }}>
        <p className="text-primary mb-2" style={{ fontSize: "13px" }}>Usage</p>
        <pre className="overflow-x-auto" style={{ color: "#87868C" }}>{`client = OpenAI(
    base_url="https://api.voltkey.dev/v1",
    api_key="vk_live_..."   # your key above
)`}</pre>
      </div>
    </div>
  );
}
