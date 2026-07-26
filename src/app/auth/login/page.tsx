"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BoltMark } from "@/components/BoltMark";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect") ?? "/dashboard";
  const redirect = rawRedirect.startsWith("/dashboard") ? rawRedirect : "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to sign in.");
        setLoading(false);
        return;
      }

      router.push(redirect);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Failed to connect to authentication server.");
      setLoading(false);
    }
  }

  const inputBase = {
    fontSize: "14px",
    border: "1px solid #28282D",
    borderRadius: "2px" as const,
    caretColor: "#E8A33D",
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="font-mono text-muted" style={{ fontSize: "12px" }}>EMAIL</label>
        <input
          type="email" required value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="font-mono text-primary bg-void w-full px-3 py-2.5 outline-none"
          style={inputBase}
          onFocus={(e) => (e.target.style.borderColor = "rgba(232,163,61,0.5)")}
          onBlur={(e) => (e.target.style.borderColor = "#28282D")}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-mono text-muted" style={{ fontSize: "12px" }}>PASSWORD</label>
        <input
          type="password" required value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••••"
          className="font-mono text-primary bg-void w-full px-3 py-2.5 outline-none"
          style={inputBase}
          onFocus={(e) => (e.target.style.borderColor = "rgba(232,163,61,0.5)")}
          onBlur={(e) => (e.target.style.borderColor = "#28282D")}
        />
      </div>

      {error && (
        <p className="font-mono" style={{ fontSize: "13px", color: "rgba(255,90,90,0.9)", padding: "8px", background: "rgba(255,90,90,0.06)", border: "1px solid rgba(255,90,90,0.2)", borderRadius: "2px" }}>
          {error}
        </p>
      )}

      <button
        type="submit" disabled={loading}
        className="btn-volt font-mono font-bold w-full py-3 mt-1"
        style={{ fontSize: "14px", opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "#0A0A0B" }}>
      <Link href="/" className="flex items-center gap-2.5 mb-10">
        <BoltMark size={22} color="#EDEAE1" />
        <span className="font-display tracking-tight" style={{ fontSize: "18px", fontWeight: 600 }}>
          <span style={{ color: "#E8A33D" }}>Volt</span>
          <span style={{ color: "#87868C" }}>Key</span>
        </span>
      </Link>

      <div className="w-full max-w-sm flex flex-col gap-6 p-8" style={{ background: "#131316", border: "1px solid #28282D", borderRadius: "2px" }}>
        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-primary" style={{ fontSize: "22px" }}>Sign in</h1>
          <p className="font-mono text-muted" style={{ fontSize: "13px" }}>Welcome back.</p>
        </div>

        {/* useSearchParams must be inside Suspense */}
        <Suspense fallback={<div className="font-mono text-muted" style={{ fontSize: "13px" }}>Loading...</div>}>
          <LoginForm />
        </Suspense>

        <p className="font-mono text-muted text-center" style={{ fontSize: "13px" }}>
          No account?{" "}
          <Link href="/auth/signup" className="text-volt hover:opacity-80 transition-opacity">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
