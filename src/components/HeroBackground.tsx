"use client";

import { useEffect, useState } from "react";

/**
 * PCB-style circuit trace background for the hero.
 * One "spark" travels along one path at a time — ambient, not busy.
 * Static traces remain as hairline guides.
 */

const PCB_PATHS = [
  // Top-left cluster
  "M 0 160 H 180 V 100 H 380 V 160 H 560 V 120 H 760",
  // Top-right diagonal
  "M 1200 80 H 980 V 160 H 760",
  // Middle left meander
  "M 0 420 H 120 V 340 H 300 V 400 H 480 V 340 H 620",
  // Middle right meander
  "M 1200 320 H 1020 V 260 H 840 V 320 H 680 V 260",
  // Bottom-left
  "M 0 580 H 200 V 520 H 420 V 560 H 600",
  // Bottom-right
  "M 1200 580 H 980 V 500 H 780 V 560 H 600",
  // Vertical connector left
  "M 300 0 V 100 H 180 V 160",
  // Vertical connector right
  "M 920 0 V 160 H 1020 V 260",
];

const VIAS = [
  { cx: 180, cy: 160 },
  { cx: 380, cy: 160 },
  { cx: 560, cy: 120 },
  { cx: 760, cy: 120 },
  { cx: 300, cy: 100 },
  { cx: 120, cy: 340 },
  { cx: 300, cy: 400 },
  { cx: 480, cy: 340 },
  { cx: 1020, cy: 260 },
  { cx: 840, cy: 320 },
  { cx: 200, cy: 520 },
  { cx: 420, cy: 560 },
  { cx: 980, cy: 500 },
  { cx: 780, cy: 560 },
];

const CYCLE_MS = 3800;

export function HeroBackground() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const id = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % PCB_PATHS.length);
    }, CYCLE_MS);
    return () => clearInterval(id);
  }, [reducedMotion]);

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      viewBox="0 0 1200 680"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {/* Static hairline traces */}
      {PCB_PATHS.map((d, i) => (
        <path
          key={`trace-${i}`}
          d={d}
          stroke="#28282D"
          strokeWidth="1"
          fill="none"
        />
      ))}

      {/* PCB vias (connection nodes) */}
      {VIAS.map((v, i) => (
        <circle
          key={`via-${i}`}
          cx={v.cx}
          cy={v.cy}
          r="2.5"
          fill="none"
          stroke="#28282D"
          strokeWidth="1"
        />
      ))}

      {/* Active spark — key change forces CSS animation restart */}
      {!reducedMotion && (
        <path
          key={`spark-${activeIdx}`}
          d={PCB_PATHS[activeIdx]}
          stroke="#E8A33D"
          strokeWidth="1.5"
          fill="none"
          pathLength="1000"
          strokeDasharray="40 960"
          strokeDashoffset="0"
          style={{
            animation: `spark-travel ${CYCLE_MS}ms linear forwards`,
            filter: "drop-shadow(0 0 5px rgba(232, 163, 61, 0.65))",
          }}
        />
      )}

      {/* Reduced-motion fallback: render active path in border-active color */}
      {reducedMotion && (
        <path
          d={PCB_PATHS[activeIdx]}
          stroke="rgba(232,163,61,0.4)"
          strokeWidth="1"
          fill="none"
        />
      )}
    </svg>
  );
}
