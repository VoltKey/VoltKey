"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SignOutButton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    try {
      setLoading(true);
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/auth/login");
      router.refresh();
    } catch (err) {
      console.error("Failed to sign out:", err);
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className={className || "font-mono text-muted hover:text-primary transition-colors w-full text-left"}
      style={{ fontSize: "12px", opacity: loading ? 0.6 : 1, ...style }}
    >
      {loading ? "Signing out..." : "Sign out →"}
    </button>
  );
}
