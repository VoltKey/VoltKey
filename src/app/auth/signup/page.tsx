"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { BoltMark } from "@/components/BoltMark";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create account.");
        setLoading(false);
        return;
      }

      setDone(true);
      setLoading(false);
    } catch (err: any) {
      setError(err?.message || "Failed to connect to authentication server.");
      setLoading(false);
    }
  }

  const inputStyle = {
    fontSize: "14px",
    border: "1px solid #28282D",
    borderRadius: "2px",
    caretColor: "#E8A33D",
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "#0A0A0B" }}>
      <Link href="/" className="flex items-center gap-2.5 mb-10">
        <BoltMark size={22} color="#EDEAE1" />
        <span className="font-display tracking-tight" style={{ fontSize: "18px", fontWeight: 600 }}>
          <span style={{ color: "#E8A33D" }}>Volt</span>
          <span style={{ color: "#87868C" }}>Key</span>
        </span>
      </Link>

      <div
        className="w-full max-w-sm flex flex-col gap-6 p-8"
        style={{ background: "#131316", border: "1px solid #28282D", borderRadius: "2px" }}
      >
        {done ? (
          <div className="flex flex-col gap-4 text-center py-4">
            <div style={{ fontSize: "28px" }}>⚡</div>
            <h2 className="font-serif text-primary" style={{ fontSize: "20px" }}>
              Check your inbox
            </h2>
            <p className="font-mono text-muted" style={{ fontSize: "13px", lineHeight: "1.7" }}>
              We sent a confirmation link to{" "}
              <span className="text-primary">{email}</span>.
              Click it to activate your account.
            </p>
            <Link
              href="/auth/login"
              className="font-mono text-volt hover:opacity-80 transition-opacity"
              style={{ fontSize: "13px" }}
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <h1 className="font-serif text-primary" style={{ fontSize: "22px" }}>
                Create account
              </h1>
              <p className="font-mono text-muted" style={{ fontSize: "13px" }}>
                One key. Every model.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-mono text-muted" style={{ fontSize: "12px" }}>EMAIL</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="font-mono text-primary bg-void w-full px-3 py-2.5 outline-none"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(232,163,61,0.5)")}
                  onBlur={(e) => (e.target.style.borderColor = "#28282D")}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-mono text-muted" style={{ fontSize: "12px" }}>PASSWORD</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="min 8 characters"
                  className="font-mono text-primary bg-void w-full px-3 py-2.5 outline-none"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(232,163,61,0.5)")}
                  onBlur={(e) => (e.target.style.borderColor = "#28282D")}
                />
              </div>

              {error && (
                <p
                  className="font-mono"
                  style={{ fontSize: "13px", color: "rgba(255,90,90,0.9)", padding: "8px", background: "rgba(255,90,90,0.06)", border: "1px solid rgba(255,90,90,0.2)", borderRadius: "2px" }}
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-volt font-mono font-bold w-full py-3 mt-1"
                style={{ fontSize: "14px", opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="font-mono text-muted text-center" style={{ fontSize: "12px", lineHeight: "1.6", opacity: 0.6 }}>
              By continuing, you agree to our{" "}
              <Link href="/terms" className="text-muted hover:text-primary transition-colors">Terms</Link>
              {" & "}
              <Link href="/privacy" className="text-muted hover:text-primary transition-colors">Privacy Policy</Link>.
            </p>

            <p className="font-mono text-muted text-center" style={{ fontSize: "13px" }}>
              Already have an account?{" "}
              <Link href="/auth/login" className="text-volt hover:opacity-80 transition-opacity">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
