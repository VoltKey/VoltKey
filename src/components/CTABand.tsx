import Link from "next/link";
import { AnimateIn } from "./AnimateIn";

/**
 * Full-width CTA band.
 * Hairline circuit trace runs across the top border.
 * H2 + single primary CTA.
 */
export function CTABand() {
  return (
    <section
      aria-labelledby="cta-heading"
      style={{
        background: "#131316",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated top-border trace */}
      <div style={{ position: "relative", height: "1px", overflow: "hidden" }}>
        <svg
          viewBox="0 0 1200 1"
          className="w-full absolute top-0 left-0"
          style={{ height: "1px" }}
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          {/* Static hairline */}
          <line x1="0" y1="0.5" x2="1200" y2="0.5" stroke="#28282D" strokeWidth="1" />
          {/* Traveling spark */}
          <line
            x1="0"
            y1="0.5"
            x2="1200"
            y2="0.5"
            stroke="#E8A33D"
            strokeWidth="1.5"
            pathLength="1000"
            strokeDasharray="60 940"
            style={{
              animation: "band-trace 6s linear infinite",
              filter: "drop-shadow(0 0 4px rgba(232,163,61,0.7))",
            }}
          />
        </svg>
      </div>

      <div className="max-w-content mx-auto px-6 py-24 flex flex-col items-center text-center gap-8">
        <AnimateIn>
          <p
            className="font-display uppercase text-volt tracking-widest"
            style={{ fontSize: "11px", letterSpacing: "0.1em" }}
          >
            Get started
          </p>
        </AnimateIn>

        <AnimateIn delay={60}>
          <h2
            id="cta-heading"
            className="font-serif text-primary max-w-lg mx-auto"
            style={{ fontSize: "clamp(28px, 4vw, 40px)", lineHeight: "1.15" }}
          >
            Stop juggling five free tiers.
          </h2>
        </AnimateIn>

        <AnimateIn delay={120}>
          <p
            className="font-mono text-muted max-w-md"
            style={{ fontSize: "15px", lineHeight: "1.75" }}
          >
            One key. Automatic failover across every major provider. Start
            routing in under two minutes.
          </p>
        </AnimateIn>

        <AnimateIn delay={180}>
          <Link
            href="/signup"
            className="btn-volt font-mono font-bold px-8 py-4 text-sm inline-flex items-center"
            style={{ fontSize: "14px" }}
          >
            Get API key — it&apos;s free
          </Link>
        </AnimateIn>

        <AnimateIn delay={220}>
          <p
            className="font-mono text-muted"
            style={{ fontSize: "12px", opacity: 0.5 }}
          >
            No credit card required · Free tier included · Cancel anytime
          </p>
        </AnimateIn>
      </div>
    </section>
  );
}
