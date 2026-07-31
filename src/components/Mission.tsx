import { AnimateIn } from "./AnimateIn";
import { Card, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Zap, Globe, Route } from "lucide-react";

const PILLARS = [
  {
    icon: Zap,
    title: "Developer-First",
    description:
      "One API key, zero complexity. We build for developers shipping real products — not enterprise procurement cycles.",
  },
  {
    icon: Globe,
    title: "Open Access",
    description:
      "Route across free tiers and your own keys. The best model for each request, not the most expensive one.",
  },
  {
    icon: Route,
    title: "Intelligent Routing",
    description:
      "Automatic failover, latency-aware selection. Your requests always find the fastest healthy path.",
  },
];

export function Mission() {
  return (
    <section
      id="mission"
      className="border-t"
      style={{ borderColor: "#28282D" }}
      aria-labelledby="mission-heading"
    >
      <div className="max-w-content mx-auto px-6 py-28">
        <AnimateIn>
          <p
            className="font-display uppercase text-volt tracking-widest text-center mb-3"
            style={{ fontSize: "11px", letterSpacing: "0.1em" }}
          >
            Our Mission
          </p>
        </AnimateIn>

        <AnimateIn delay={40}>
          <h2
            id="mission-heading"
            className="font-serif text-primary text-center max-w-2xl mx-auto mb-6"
            style={{
              fontSize: "clamp(28px, 3.5vw, 40px)",
              lineHeight: "1.15",
            }}
          >
            Built for builders.{" "}
            <em style={{ fontStyle: "italic" }}>Not</em> for billing
            departments.
          </h2>
        </AnimateIn>

        <AnimateIn delay={80}>
          <p
            className="font-mono text-muted text-center max-w-xl mx-auto mb-16"
            style={{ fontSize: "15px", lineHeight: "1.75" }}
          >
            Every developer deserves access to the best AI models without
            juggling five dashboards, five API keys, and five billing pages.
            VoltKey makes that real.
          </p>
        </AnimateIn>

        <AnimateIn delay={120}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <Card key={pillar.title} className="mission-card p-0">
                  <CardHeader className="p-8">
                    <div
                      className="w-10 h-10 rounded-sm flex items-center justify-center mb-4"
                      style={{
                        background: "rgba(240, 122, 48, 0.1)",
                        border: "1px solid rgba(240, 122, 48, 0.2)",
                      }}
                    >
                      <Icon
                        size={20}
                        style={{ color: "#F07A30" }}
                        strokeWidth={1.5}
                      />
                    </div>
                    <CardTitle>{pillar.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {pillar.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
