"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BoltMark } from "./BoltMark";

const NAV_LINKS = [
  { label: "Docs", href: "/docs" },
  { label: "Models", href: "/models" },
  { label: "Pricing", href: "/pricing" },
  { label: "Changelog", href: "/changelog" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center"
      style={{
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        background: scrolled
          ? "rgba(10, 10, 11, 0.75)"
          : "rgba(10, 10, 11, 0.55)",
        borderBottom: "1px solid #28282D",
        transition: "background 300ms ease",
      }}
    >
      <div className="mx-auto w-full max-w-content px-6 flex items-center justify-between gap-8">
        {/* ── Logo ── */}
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0 group"
          aria-label="VoltKey home"
        >
          <span className="bolt-mark">
            <BoltMark size={22} color="#EDEAE1" className="group-hover:text-volt transition-colors duration-200" />
          </span>
          <span
            className="font-display text-primary tracking-tight leading-none select-none"
            style={{ fontSize: "18px", fontWeight: 600 }}
          >
            <span style={{ color: "#E8A33D" }}>Volt</span>
            <span style={{ color: "#87868C" }}>Key</span>
          </span>
        </Link>

        {/* ── Center links ── */}
        <nav
          className="hidden md:flex items-center gap-8"
          aria-label="Primary navigation"
        >
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="nav-link font-mono text-sm text-muted hover:text-primary transition-colors duration-200"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* ── Right CTAs ── */}
        <div className="flex items-center gap-4 shrink-0">
          <Link
            href="/auth/login"
            className="font-mono text-sm text-muted hover:text-primary transition-colors duration-200"
          >
            Log in
          </Link>
          <Link
            href="/auth/signup"
            className="btn-volt font-mono text-sm font-bold px-4 py-2 inline-flex items-center"
            style={{ fontSize: "13px" }}
          >
            Get API key
          </Link>
        </div>
      </div>
    </header>
  );
}
