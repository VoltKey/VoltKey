import { AnimateIn } from "./AnimateIn";

// Mini sparkline SVG for the large "Auto Failover" tile
function Sparkline() {
  const points = [40, 28, 55, 22, 60, 18, 42, 35, 20, 38, 15, 30, 45, 12, 50, 8];
  const max = Math.max(...points);
  const min = Math.min(...points);
  const w = 160;
  const h = 48;
  const xStep = w / (points.length - 1);

  const d = points
    .map((p, i) => {
      const x = i * xStep;
      const y = h - ((p - min) / (max - min)) * h;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      aria-label="Latency sparkline"
      role="img"
    >
      {/* Fill area */}
      <path
        d={`${d} L ${w} ${h} L 0 ${h} Z`}
        fill="rgba(240,122,48,0.07)"
      />
      {/* Line */}
      <path d={d} stroke="#F07A30" strokeWidth="1.5" fill="none" />
      {/* Current point dot */}
      <circle
        cx={(points.length - 1) * xStep}
        cy={h - ((points[points.length - 1] - min) / (max - min)) * h}
        r="3"
        fill="#F07A30"
        style={{ filter: "drop-shadow(0 0 4px rgba(240,122,48,0.8))" }}
      />
    </svg>
  );
}

const FEATURES = [
  {
    id: "failover",
    title: "Auto Failover",
    body: "When a provider hits a rate limit or drops, the next one picks up mid-request. No retries written. No errors reaching your users. Current reroutes — it doesn't stop.",
    span: "large",
    visual: <Sparkline />,
    eyebrow: "Core mechanic",
  },
  {
    id: "byok",
    title: "Bring Your Own Keys",
    body: "Use your existing provider API keys alongside free-tier credits. VoltKey routes across both.",
    span: "small",
  },
  {
    id: "analytics",
    title: "Cost & Latency",
    body: "Per-model breakdown — know exactly what each request costs before the bill arrives.",
    span: "small",
  },
  {
    id: "streaming",
    title: "Native Streaming",
    body: "Token-by-token streaming is preserved across failovers. The stream doesn't stutter.",
    span: "small",
  },
  {
    id: "openai",
    title: "OpenAI-Compatible",
    body: "Any OpenAI SDK. Any language. Your existing code works on day one.",
    span: "small",
  },
];

export function Features() {
  const large = FEATURES.find((f) => f.span === "large")!;
  const smalls = FEATURES.filter((f) => f.span === "small");

  return (
    <section
      id="features"
      className="border-t"
      style={{ borderColor: "#28282D" }}
      aria-labelledby="features-heading"
    >
      <div className="max-w-content mx-auto px-6 py-24">
        <AnimateIn>
          <p
            className="font-display uppercase text-volt tracking-widest mb-3"
            style={{ fontSize: "11px", letterSpacing: "0.1em" }}
          >
            What you get
          </p>
        </AnimateIn>
        <AnimateIn delay={40}>
          <h2
            id="features-heading"
            className="font-serif text-primary mb-12"
            style={{ fontSize: "clamp(28px, 3.5vw, 40px)", lineHeight: "1.15" }}
          >
            Built to route, not just{" "}
            <em style={{ fontStyle: "italic" }}>wrap</em>.
          </h2>
        </AnimateIn>

        {/*
         * Bento grid layout:
         * ┌──────────────────────┬──────────┐
         * │   AUTO FAILOVER      │   BYOK   │
         * │   (col-span 2)       │          │
         * ├──────────┬───────────┼──────────┤
         * │ANALYTICS │ STREAMING │  OPENAI  │
         * └──────────┴───────────┴──────────┘
         */}
        <AnimateIn delay={80}>
          <div className="bento-grid">
            {/* AUTO FAILOVER — large tile, 2 cols */}
            <div
              className="bento-tile bento-tile-large p-8 flex flex-col justify-between gap-8"
              style={{ background: "#131316", minHeight: "220px" }}
            >
              <div className="flex flex-col gap-3">
                <p
                  className="font-display uppercase text-volt tracking-widest"
                  style={{ fontSize: "10px", letterSpacing: "0.1em" }}
                >
                  {large.eyebrow}
                </p>
                <h3
                  className="font-serif text-primary"
                  style={{ fontSize: "20px", lineHeight: "1.3" }}
                >
                  {large.title}
                </h3>
                <p
                  className="font-mono text-muted"
                  style={{ fontSize: "14px", lineHeight: "1.7", maxWidth: "38ch" }}
                >
                  {large.body}
                </p>
              </div>
              {/* Sparkline visual */}
              <div className="flex flex-col gap-1">
                <p
                  className="font-mono text-muted"
                  style={{ fontSize: "10px", letterSpacing: "0.06em", opacity: 0.6 }}
                >
                  LATENCY ↓ ACROSS FAILOVER
                </p>
                {large.visual}
              </div>
            </div>

            {/* BYOK — right column, row 1 */}
            <div
              className="bento-tile p-6 flex flex-col gap-3 bg-surface"
              style={{ background: "#131316" }}
            >
              <h3
                className="font-serif text-primary"
                style={{ fontSize: "20px", lineHeight: "1.3" }}
              >
                {smalls[0].title}
              </h3>
              <p
                className="font-mono text-muted"
                style={{ fontSize: "14px", lineHeight: "1.7" }}
              >
                {smalls[0].body}
              </p>
            </div>

            {/* Row 2: Analytics, Streaming, OpenAI-Compatible */}
            {smalls.slice(1).map((f) => (
              <div
                key={f.id}
                className="bento-tile p-6 flex flex-col gap-3"
                style={{ background: "#131316" }}
              >
                <h3
                  className="font-serif text-primary"
                  style={{ fontSize: "20px", lineHeight: "1.3" }}
                >
                  {f.title}
                </h3>
                <p
                  className="font-mono text-muted"
                  style={{ fontSize: "14px", lineHeight: "1.7" }}
                >
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
