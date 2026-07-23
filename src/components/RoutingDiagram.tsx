"use client";

import { useEffect, useState } from "react";
import { BoltMark } from "./BoltMark";

const PROVIDERS = [
  { name: "Groq", y: 72, color: "#F55036" },
  { name: "Gemini", y: 152, color: "#4285F4" },
  { name: "OpenAI", y: 232, color: "#19C37D" },
  { name: "Anthropic", y: 312, color: "#CC9B7A" },
];

// Right-angle paths from VoltKey node (right edge ~x=330) to each provider (left edge ~x=430)
// Routing point: x=390 vertical junction
const PROVIDER_PATHS = [
  "M 330 192 H 390 V 72 H 430",   // to Groq
  "M 330 192 H 390 V 152 H 430",  // to Gemini
  "M 330 192 H 390 V 232 H 430",  // to OpenAI
  "M 330 192 H 390 V 312 H 430",  // to Anthropic
];

const USER_TO_VK_PATH = "M 60 192 H 200";

const CYCLE_MS = 2800;

export function RoutingDiagram() {
  const [active, setActive] = useState(0);
  const [rateLimited, setRateLimited] = useState<number | null>(null);
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

    const cycle = () => {
      const next = (active + 1) % PROVIDERS.length;
      // Briefly show rate-limit on every 3rd provider change
      if (active % 3 === 2) {
        setRateLimited(active);
        const t1 = setTimeout(() => {
          setRateLimited(null);
          setActive(next);
        }, 700);
        return () => clearTimeout(t1);
      } else {
        setActive(next);
      }
    };

    const id = setTimeout(cycle, CYCLE_MS);
    return () => clearTimeout(id);
  }, [active, reducedMotion]);

  return (
    <div className="relative w-full h-full min-h-[380px]">
      <svg
        viewBox="0 0 600 384"
        className="w-full h-full"
        style={{ overflow: "visible" }}
        aria-label="VoltKey routing diagram: requests flow from user through VoltKey to providers"
        role="img"
      >
        {/* ── Static hairline traces ── */}
        {/* User → VoltKey */}
        <path
          d={USER_TO_VK_PATH}
          stroke="#28282D"
          strokeWidth="1"
          fill="none"
        />
        {/* VoltKey → all providers (static) */}
        {PROVIDER_PATHS.map((d, i) => (
          <path key={`static-${i}`} d={d} stroke="#28282D" strokeWidth="1" fill="none" />
        ))}

        {/* Junction dot at x=390 */}
        <circle cx="390" cy="192" r="2.5" fill="#28282D" />

        {/* ── Animated sparks ── */}
        {!reducedMotion && (
          <>
            {/* Permanent user → VK spark */}
            <path
              key="user-spark"
              d={USER_TO_VK_PATH}
              stroke="#E8A33D"
              strokeWidth="1.5"
              fill="none"
              pathLength="1000"
              strokeDasharray="120 880"
              style={{
                animation: `routing-spark ${CYCLE_MS * 0.6}ms linear infinite`,
                filter: "drop-shadow(0 0 4px rgba(232,163,61,0.7))",
              }}
            />
            {/* Active provider spark */}
            <path
              key={`provider-spark-${active}`}
              d={PROVIDER_PATHS[active]}
              stroke="#E8A33D"
              strokeWidth="1.5"
              fill="none"
              pathLength="1000"
              strokeDasharray="100 900"
              style={{
                animation: `routing-spark ${CYCLE_MS * 0.7}ms linear forwards`,
                filter: "drop-shadow(0 0 4px rgba(232,163,61,0.7))",
                animationDelay: `${CYCLE_MS * 0.25}ms`,
              }}
            />
          </>
        )}

        {/* ── User node ── */}
        <circle
          cx="40"
          cy="192"
          r="22"
          fill="#131316"
          stroke="#28282D"
          strokeWidth="1"
        />
        <text
          x="40"
          y="189"
          textAnchor="middle"
          fill="#87868C"
          fontSize="10"
          fontFamily="var(--font-space-mono), monospace"
        >
          your
        </text>
        <text
          x="40"
          y="201"
          textAnchor="middle"
          fill="#87868C"
          fontSize="10"
          fontFamily="var(--font-space-mono), monospace"
        >
          app
        </text>

        {/* ── VoltKey central node ── */}
        <circle
          cx="265"
          cy="192"
          r="42"
          fill="#131316"
          stroke={rateLimited !== null ? "#28282D" : "rgba(232,163,61,0.45)"}
          strokeWidth="1.5"
          style={{ transition: "stroke 400ms ease" }}
        />
        {/* Bolt mark glyph inside VK node */}
        <text
          x="265"
          y="182"
          textAnchor="middle"
          fill="#E8A33D"
          fontSize="11"
          fontFamily="var(--font-stick-no-bills), sans-serif"
          fontWeight="600"
          letterSpacing="0.05em"
        >
          VOLT
        </text>
        <text
          x="265"
          y="196"
          textAnchor="middle"
          fill="#87868C"
          fontSize="11"
          fontFamily="var(--font-stick-no-bills), sans-serif"
          fontWeight="600"
          letterSpacing="0.05em"
        >
          KEY
        </text>
        <text
          x="265"
          y="210"
          textAnchor="middle"
          fill="#28282D"
          fontSize="9"
          fontFamily="var(--font-space-mono), monospace"
        >
          router
        </text>

        {/* ── Provider nodes ── */}
        {PROVIDERS.map((p, i) => {
          const isActive = i === active;
          const isRateLimited = i === rateLimited;

          return (
            <g key={p.name}>
              {/* Provider box */}
              <rect
                x="430"
                y={p.y - 22}
                width="120"
                height="44"
                rx="2"
                fill="#131316"
                stroke={
                  isRateLimited
                    ? "rgba(255,80,80,0.5)"
                    : isActive
                    ? "rgba(232,163,61,0.45)"
                    : "#28282D"
                }
                strokeWidth="1"
                opacity={isRateLimited ? 0.45 : 1}
                style={{ transition: "stroke 300ms ease, opacity 300ms ease" }}
              />
              <text
                x="490"
                y={p.y + 5}
                textAnchor="middle"
                fill={isRateLimited ? "#87868C" : isActive ? "#EDEAE1" : "#87868C"}
                fontSize="13"
                fontFamily="var(--font-space-mono), monospace"
                opacity={isRateLimited ? 0.45 : 1}
                style={{ transition: "fill 300ms ease, opacity 300ms ease" }}
              >
                {p.name}
              </text>

              {/* Rate limit indicator */}
              {isRateLimited && (
                <text
                  x="490"
                  y={p.y - 28}
                  textAnchor="middle"
                  fill="rgba(255,80,80,0.8)"
                  fontSize="9"
                  fontFamily="var(--font-space-mono), monospace"
                  letterSpacing="0.04em"
                >
                  RATE LIMITED
                </text>
              )}

              {/* Active indicator dot */}
              {isActive && !isRateLimited && (
                <circle
                  cx="552"
                  cy={p.y - 15}
                  r="3"
                  fill="rgba(232,163,61,0.9)"
                  style={{ filter: "drop-shadow(0 0 3px rgba(232,163,61,0.8))" }}
                />
              )}
            </g>
          );
        })}

        {/* ── Labels ── */}
        <text
          x="40"
          y="228"
          textAnchor="middle"
          fill="#28282D"
          fontSize="8"
          fontFamily="var(--font-space-mono), monospace"
          letterSpacing="0.06em"
        >
          REQUEST
        </text>
        <text
          x="490"
          y="350"
          textAnchor="middle"
          fill="#28282D"
          fontSize="8"
          fontFamily="var(--font-space-mono), monospace"
          letterSpacing="0.06em"
        >
          PROVIDERS
        </text>
      </svg>
    </div>
  );
}
