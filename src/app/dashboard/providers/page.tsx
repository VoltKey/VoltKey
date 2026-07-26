"use client";

import { useEffect, useState } from "react";
import { providerKeysApi, type ProviderKeyRecord } from "@/lib/api";

const PROVIDERS = [
  { id: "openai",    label: "OpenAI",     hint: "sk-proj-..." },
  { id: "groq",      label: "Groq",       hint: "gsk_..." },
  { id: "anthropic", label: "Anthropic",  hint: "sk-ant-..." },
  { id: "gemini",    label: "Gemini",     hint: "AIza..." },
  { id: "mistral",   label: "Mistral",    hint: "..." },
  { id: "together",  label: "Together AI",hint: "..." },
];

export default function ProvidersPage() {
  const [stored, setStored] = useState<Record<string, ProviderKeyRecord>>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    providerKeysApi
      .list()
      .then((records) => {
        const map: Record<string, ProviderKeyRecord> = {};
        records.forEach((r) => (map[r.provider_name] = r));
        setStored(map);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load provider keys"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(providerId: string) {
    if (!inputValue.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const record = await providerKeysApi.upsert(providerId, inputValue.trim());
      setStored((prev) => ({ ...prev, [providerId]: record }));
      setEditing(null);
      setInputValue("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save key");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(providerId: string) {
    if (!confirm(`Remove your ${providerId} key? VoltKey will fall back to platform keys.`)) return;
    try {
      await providerKeysApi.remove(providerId);
      setStored((prev) => {
        const next = { ...prev };
        delete next[providerId];
        return next;
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove key");
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <p className="font-display uppercase tracking-widest text-volt" style={{ fontSize: "10px", letterSpacing: "0.1em" }}>Provider Keys</p>
        <h1 className="font-serif text-primary" style={{ fontSize: "28px" }}>Bring your own keys</h1>
        <p className="font-mono text-muted" style={{ fontSize: "13px", lineHeight: "1.7" }}>
          Your keys take priority over platform keys. They&apos;re Fernet-encrypted at rest — only the ciphertext is stored.
        </p>
      </div>

      {loading ? (
        <p className="font-mono text-muted" style={{ fontSize: "13px" }}>Loading...</p>
      ) : (
        <div style={{ border: "1px solid #28282D", borderRadius: "2px", overflow: "hidden" }}>
          {PROVIDERS.map((p, i) => {
            const isSet = !!stored[p.id];
            const isEditing = editing === p.id;

            return (
              <div
                key={p.id}
                className="flex flex-col gap-3 px-5 py-4"
                style={{ borderTop: i > 0 ? "1px solid #28282D" : "none", background: "#131316" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-primary" style={{ fontSize: "14px" }}>{p.label}</span>
                    <span
                      className="font-mono"
                      style={{
                        fontSize: "10px",
                        letterSpacing: "0.06em",
                        color: isSet ? "#E8A33D" : "#87868C",
                        background: isSet ? "rgba(232,163,61,0.1)" : "rgba(135,134,140,0.1)",
                        padding: "2px 6px",
                        borderRadius: "2px",
                        border: `1px solid ${isSet ? "rgba(232,163,61,0.25)" : "rgba(135,134,140,0.2)"}`,
                      }}
                    >
                      {isSet ? "SET" : "NOT SET"}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    {isSet && !isEditing && (
                      <button
                        onClick={() => handleRemove(p.id)}
                        className="font-mono text-muted hover:text-primary transition-colors"
                        style={{ fontSize: "12px" }}
                      >
                        Remove
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditing(isEditing ? null : p.id);
                        setInputValue("");
                        setError(null);
                      }}
                      className="font-mono transition-colors"
                      style={{ fontSize: "12px", color: isEditing ? "#87868C" : "#E8A33D" }}
                    >
                      {isEditing ? "Cancel" : isSet ? "Update" : "Add key"}
                    </button>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex flex-col gap-2">
                    <input
                      type="password"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={p.hint}
                      autoFocus
                      className="font-mono text-primary bg-void px-3 py-2 outline-none w-full"
                      style={{ fontSize: "13px", border: "1px solid rgba(232,163,61,0.3)", borderRadius: "2px" }}
                      onKeyDown={(e) => e.key === "Enter" && handleSave(p.id)}
                    />
                    {error && (
                      <p className="font-mono" style={{ fontSize: "12px", color: "rgba(255,90,90,0.9)" }}>{error}</p>
                    )}
                    <button
                      onClick={() => handleSave(p.id)}
                      disabled={saving || !inputValue.trim()}
                      className="btn-volt font-mono font-bold px-4 py-2 self-start"
                      style={{ fontSize: "12px", opacity: saving || !inputValue.trim() ? 0.5 : 1 }}
                    >
                      {saving ? "Saving..." : "Save key"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="p-4 font-mono text-muted" style={{ fontSize: "12px", lineHeight: "1.8", background: "#131316", border: "1px solid #28282D", borderRadius: "2px" }}>
        <p style={{ opacity: 0.6 }}>
          Keys are encrypted with Fernet (AES-128-CBC) before storage. The plaintext key is never persisted. VoltKey&apos;s encryption key is separate from your database credentials.
        </p>
      </div>
    </div>
  );
}
