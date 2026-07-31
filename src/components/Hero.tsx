"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { HeroBackground } from "./HeroBackground";
import { AnimateIn } from "./AnimateIn";
import { Badge } from "./ui/badge";

/**
 * Lightning bolt SVG that strikes on load, then holds at low opacity with ambient flicker.
 */
function LightningBolt() {
  const [struck, setStruck] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStruck(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!struck) return null;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      aria-hidden="true"
    >
      <svg
        width="180"
        height="320"
        viewBox="0 0 180 320"
        fill="none"
        className="lightning-bolt"
        style={{ opacity: 0 }}
      >
        {/* Main bolt */}
        <path
          d="M 100 0 L 60 130 L 95 130 L 50 220 L 90 220 L 30 320 L 120 195 L 82 195 L 130 105 L 88 105 Z"
          fill="#F07A30"
          opacity="0.15"
        />
        {/* Inner glow line */}
        <path
          d="M 95 10 L 65 125 L 92 125 L 55 215 L 88 215 L 40 305"
          stroke="#F07A30"
          strokeWidth="2"
          fill="none"
          opacity="0.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Hot center line */}
        <path
          d="M 92 20 L 68 120 L 90 120 L 58 210 L 86 210 L 45 295"
          stroke="#EDEAE1"
          strokeWidth="1"
          fill="none"
          opacity="0.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Ambient glow overlay after strike */}
      <div
        className="absolute inset-0 pointer-events-none lightning-bolt-ambient"
        style={{
          background:
            "radial-gradient(ellipse 30% 40% at 50% 45%, rgba(240, 122, 48, 0.06) 0%, transparent 100%)",
          opacity: 0,
        }}
      />
    </div>
  );
}

export function Hero() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden"
      style={{ paddingTop: "64px" }} // account for fixed nav height
      aria-label="Hero"
    >
      {/* PCB circuit trace background */}
      <HeroBackground />

      {/* Lightning bolt strike */}
      <LightningBolt />

      {/* Radial fade overlay so text stays legible */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 0%, rgba(10,10,11,0.55) 60%, rgba(10,10,11,0.95) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-content px-6 flex flex-col items-center text-center">
        {/* Eyebrow */}
        <AnimateIn delay={0}>
          <Badge
            variant="outline"
            className="mb-6 font-display uppercase tracking-widest text-volt border-volt/30"
            style={{ fontSize: "11px", letterSpacing: "0.08em" }}
          >
            ⚡ Route Anything · Miss Nothing
          </Badge>
        </AnimateIn>

        {/* H1 */}
        <AnimateIn delay={60}>
          <h1
            className="font-serif text-primary tracking-tight max-w-4xl mx-auto mb-6"
            style={{
              fontSize: "clamp(36px, 5.5vw, 64px)",
              lineHeight: 1.05,
              fontWeight: 400,
            }}
          >
            One key. Every model.{" "}
            <em className="font-serif-italic text-primary not-italic inline">
              Never
            </em>{" "}
            waiting on a limit.
          </h1>
        </AnimateIn>

        {/* Subhead */}
        <AnimateIn delay={120}>
          <p
            className="font-mono text-muted max-w-2xl mx-auto mb-10"
            style={{ fontSize: "17px", lineHeight: 1.7 }}
          >
            Free-tier and your own provider keys, routed through one endpoint
            that fails over before you notice.
          </p>
        </AnimateIn>

        {/* CTAs */}
        <AnimateIn delay={180}>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
            <Link
              href={isLoggedIn ? "/dashboard" : "/auth/signup"}
              className="btn-volt font-mono font-bold px-6 py-3 text-sm inline-flex items-center gap-1.5"
            >
              {isLoggedIn ? "Go to Dashboard →" : "Get API key"}
            </Link>
            <a
              href="#features"
              onClick={(e) => {
                e.preventDefault();
                document
                  .querySelector("#features")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="btn-ghost font-mono text-sm px-6 py-3 inline-flex items-center gap-2"
            >
              Explore features{" "}
              <span className="arrow" aria-hidden="true">
                →
              </span>
            </a>
          </div>
        </AnimateIn>

        {/* Subtle caption */}
        <AnimateIn delay={240}>
          <p
            className="font-mono text-muted mt-4"
            style={{ fontSize: "12px", opacity: 0.6 }}
          >
            OpenAI-compatible endpoint · No vendor lock-in · Free to start
          </p>
        </AnimateIn>
      </div>

      {/* Bottom fade into next section */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent, var(--bg-void))",
        }}
      />
    </section>
  );
}
