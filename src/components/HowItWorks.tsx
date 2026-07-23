import { AnimateIn } from "./AnimateIn";
import { RoutingDiagram } from "./RoutingDiagram";

export function HowItWorks() {
  return (
    <section
      className="relative border-t"
      style={{ borderColor: "#28282D" }}
      aria-labelledby="how-it-works-heading"
    >
      <div className="max-w-content mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-center">

          {/* ── Left: copy (40%) ── */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <AnimateIn>
              <p
                className="font-display uppercase text-volt tracking-widest"
                style={{ fontSize: "11px", letterSpacing: "0.1em" }}
              >
                The break in the ring
              </p>
            </AnimateIn>

            <AnimateIn delay={60}>
              <h2
                id="how-it-works-heading"
                className="font-serif text-primary"
                style={{ fontSize: "clamp(28px, 3.5vw, 40px)", lineHeight: "1.15" }}
              >
                Not a pipeline.{" "}
                <em style={{ fontStyle: "italic" }}>Live</em> routing,
                every request.
              </h2>
            </AnimateIn>

            <AnimateIn delay={120}>
              <p
                className="font-mono text-muted"
                style={{ fontSize: "15px", lineHeight: "1.75" }}
              >
                A request comes in on your key. VoltKey checks which provider is
                fastest and healthy right now, sends it there, and if that
                provider rate-limits or times out mid-request, reroutes before
                you&apos;d notice — same key, same code, no retry logic on your
                end.
              </p>
            </AnimateIn>

            <AnimateIn delay={180}>
              <p
                className="font-mono text-muted"
                style={{ fontSize: "15px", lineHeight: "1.75" }}
              >
                The break in the ring is the point. Current doesn&apos;t
                complete the loop — it gets redirected through the gap. That{" "}
                <em style={{ fontStyle: "italic" }}>is</em> routing.
              </p>
            </AnimateIn>

            {/* Stats row */}
            <AnimateIn delay={240}>
              <div
                className="grid grid-cols-2 gap-0 mt-4"
                style={{ borderTop: "1px solid #28282D" }}
              >
                <div
                  className="py-4 pr-4"
                  style={{ borderRight: "1px solid #28282D" }}
                >
                  <div
                    className="font-mono text-volt"
                    style={{ fontSize: "22px", fontWeight: 700 }}
                  >
                    &lt;50ms
                  </div>
                  <div
                    className="font-mono text-muted mt-1"
                    style={{ fontSize: "12px" }}
                  >
                    failover overhead
                  </div>
                </div>
                <div className="py-4 pl-4">
                  <div
                    className="font-mono text-volt"
                    style={{ fontSize: "22px", fontWeight: 700 }}
                  >
                    1 line
                  </div>
                  <div
                    className="font-mono text-muted mt-1"
                    style={{ fontSize: "12px" }}
                  >
                    integration change
                  </div>
                </div>
              </div>
            </AnimateIn>
          </div>

          {/* ── Right: animated diagram (60%) ── */}
          <AnimateIn
            className="lg:col-span-3"
            delay={80}
          >
            <div
              className="relative rounded-sm overflow-hidden p-6"
              style={{
                background: "#131316",
                border: "1px solid #28282D",
                minHeight: "380px",
              }}
            >
              {/* Corner label */}
              <div
                className="absolute top-3 left-4 font-display uppercase tracking-widest text-muted"
                style={{ fontSize: "9px", letterSpacing: "0.1em", opacity: 0.6 }}
              >
                Live routing
              </div>

              <RoutingDiagram />
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}
