"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { SignOutButton } from "./SignOutButton";
import { BoltMark } from "./BoltMark";
import { Zap, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Integration", href: "#integration" },
  { label: "Security", href: "#security" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAnchorClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault();
      setMobileOpen(false);
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    []
  );

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
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
              <span style={{ color: "#F07A30" }}>Volt</span>
              <span style={{ color: "#87868C" }}>Key</span>
            </span>
          </Link>

          {/* ── Center links (desktop) ── */}
          <nav
            className="hidden md:flex items-center gap-8"
            aria-label="Primary navigation"
          >
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                onClick={(e) => handleAnchorClick(e, href)}
                className="nav-link font-mono text-sm text-muted hover:text-primary transition-colors duration-200 inline-flex items-center gap-1.5 group/link"
              >
                <Zap
                  size={12}
                  className="opacity-0 group-hover/link:opacity-100 transition-opacity duration-200"
                  style={{ color: "#F07A30" }}
                  strokeWidth={2}
                />
                {label}
              </a>
            ))}
          </nav>

          {/* ── Right CTAs + mobile toggle ── */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Mobile hamburger */}
            <button
              type="button"
              className="md:hidden flex items-center justify-center w-8 h-8 text-muted hover:text-primary transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Desktop auth buttons */}
            <div className="hidden md:flex items-center gap-4">
              {isLoggedIn ? (
                <>
                  <SignOutButton className="font-mono text-sm text-muted hover:text-primary transition-colors duration-200" />
                  <Link
                    href="/dashboard"
                    className="btn-volt font-mono text-sm font-bold px-4 py-2 inline-flex items-center gap-1.5"
                    style={{ fontSize: "13px" }}
                  >
                    Dashboard →
                  </Link>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile nav overlay ── */}
      <div
        className={`mobile-nav-overlay fixed inset-0 z-40 bg-black/60 md:hidden ${
          mobileOpen ? "open" : ""
        }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />
      <div
        className={`mobile-nav-panel fixed top-0 right-0 bottom-0 z-40 w-72 md:hidden ${
          mobileOpen ? "open" : ""
        }`}
        style={{
          background: "#131316",
          borderLeft: "1px solid #28282D",
        }}
      >
        <div className="flex flex-col pt-20 px-6 gap-1">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={(e) => handleAnchorClick(e, href)}
              className="font-mono text-sm text-muted hover:text-primary transition-colors duration-200 py-3 flex items-center gap-2"
              style={{ borderBottom: "1px solid #28282D" }}
            >
              <Zap size={12} style={{ color: "#F07A30" }} strokeWidth={2} />
              {label}
            </a>
          ))}

          <div className="mt-6 flex flex-col gap-3">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="btn-volt font-mono text-sm font-bold px-4 py-3 inline-flex items-center justify-center"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard →
                </Link>
                <SignOutButton
                  className="font-mono text-sm text-muted hover:text-primary transition-colors duration-200 py-2"
                />
              </>
            ) : (
              <>
                <Link
                  href="/auth/signup"
                  className="btn-volt font-mono text-sm font-bold px-4 py-3 inline-flex items-center justify-center"
                  onClick={() => setMobileOpen(false)}
                >
                  Get API key
                </Link>
                <Link
                  href="/auth/login"
                  className="font-mono text-sm text-muted hover:text-primary transition-colors duration-200 py-2 text-center"
                  onClick={() => setMobileOpen(false)}
                >
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
