import Link from "next/link";
import { HeroBackground } from "./HeroBackground";
import { AnimateIn } from "./AnimateIn";

export function Hero() {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden"
      style={{ paddingTop: "64px" }} // account for fixed nav height
      aria-label="Hero"
    >
      {/* PCB circuit trace background */}
      <HeroBackground />

      {/* Radial fade overlay so text stays legible */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 0%, rgba(10,10,11,0.55) 60%, rgba(10,10,11,0.95) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-content mx-auto px-6 py-24 flex flex-col items-center gap-8">
        {/* Eyebrow */}
        <AnimateIn delay={0}>
          <p
            className="font-display uppercase tracking-widest text-volt"
            style={{ fontSize: "12px", letterSpacing: "0.12em" }}
          >
            Route anything · Miss nothing
          </p>
        </AnimateIn>

        {/* H1 */}
        <AnimateIn delay={60}>
          <h1
            className="font-serif text-primary max-w-3xl mx-auto"
            style={{
              fontSize: "clamp(40px, 5.5vw, 64px)",
              lineHeight: "1.05",
              letterSpacing: "-0.02em",
            }}
          >
            One key. Every model.{" "}
            <em
              className="not-italic"
              style={{ fontStyle: "italic", color: "#EDEAE1" }}
            >
              Never
            </em>{" "}
            waiting on a limit.
          </h1>
        </AnimateIn>

        {/* Subhead */}
        <AnimateIn delay={120}>
          <p
            className="font-mono text-muted max-w-xl mx-auto"
            style={{ fontSize: "17px", lineHeight: "1.7" }}
          >
            Free-tier and your own provider keys, routed through one endpoint
            that fails over before you notice.
          </p>
        </AnimateIn>

        {/* CTAs */}
        <AnimateIn delay={180}>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
            <Link
              href="/signup"
              className="btn-volt font-mono font-bold px-6 py-3 text-sm inline-flex items-center"
            >
              Get API key
            </Link>
            <Link
              href="/models"
              className="btn-ghost font-mono text-sm px-6 py-3 inline-flex items-center gap-2"
            >
              Explore models{" "}
              <span className="arrow" aria-hidden="true">
                →
              </span>
            </Link>
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
