import { AnimateIn } from "./AnimateIn";
import { Shield, EyeOff, Lock, BadgeCheck } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./ui/accordion";

const SECURITY_FEATURES = [
  {
    icon: Shield,
    title: "End-to-End Encryption",
    description:
      "All API traffic is encrypted in transit via TLS 1.3. Provider keys are encrypted at rest with AES-256.",
  },
  {
    icon: EyeOff,
    title: "Zero Data Logging",
    description:
      "We route your requests. We don't read them. No prompt logging, no response caching, no training data collection.",
  },
  {
    icon: Lock,
    title: "Key Isolation",
    description:
      "Each user's provider keys are stored in isolated, encrypted vaults. No shared credential pools. Your keys never touch another user's context.",
  },
  {
    icon: BadgeCheck,
    title: "Compliance Path",
    description:
      "Building toward SOC 2 Type II. Security isn't a feature — it's the infrastructure everything else runs on.",
  },
];

const FAQ_ITEMS = [
  {
    q: "Where are my API keys stored?",
    a: "Your provider API keys are encrypted with AES-256 and stored in isolated per-user vaults. They are only decrypted in-memory at the moment of a request, never written to logs or disk in plaintext.",
  },
  {
    q: "Do you log or store my prompts?",
    a: "No. VoltKey acts as a pass-through router. Your prompts and model responses are forwarded directly to the provider and never stored, cached, or used for any purpose beyond routing.",
  },
  {
    q: "Can VoltKey employees see my data?",
    a: "No. The routing layer is designed so that request content is never accessible to internal systems or personnel. We log metadata (model, latency, token count) for analytics — never content.",
  },
  {
    q: "What happens during a failover?",
    a: "When a provider rate-limits or fails, VoltKey reroutes to the next healthy provider within the same request. Your credentials for the fallback provider are decrypted in-memory, used, and discarded. No retry data is persisted.",
  },
];

export function Security() {
  return (
    <section
      id="security"
      className="border-t"
      style={{ borderColor: "#28282D" }}
      aria-labelledby="security-heading"
    >
      <div className="max-w-content mx-auto px-6 py-28">
        <AnimateIn>
          <p
            className="font-display uppercase text-volt tracking-widest text-center mb-3"
            style={{ fontSize: "11px", letterSpacing: "0.1em" }}
          >
            Security
          </p>
        </AnimateIn>

        <AnimateIn delay={40}>
          <h2
            id="security-heading"
            className="font-serif text-primary text-center max-w-2xl mx-auto mb-6"
            style={{
              fontSize: "clamp(28px, 3.5vw, 40px)",
              lineHeight: "1.15",
            }}
          >
            Your keys. Your data.{" "}
            <em style={{ fontStyle: "italic" }}>Our</em> obsession.
          </h2>
        </AnimateIn>

        <AnimateIn delay={80}>
          <p
            className="font-mono text-muted text-center max-w-xl mx-auto mb-16"
            style={{ fontSize: "15px", lineHeight: "1.75" }}
          >
            VoltKey handles the most sensitive part of your AI stack — your
            provider credentials. Here&apos;s how we keep them safe.
          </p>
        </AnimateIn>

        {/* Security features grid */}
        <AnimateIn delay={120}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
            {SECURITY_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="security-card rounded-sm border border-hairline bg-surface p-8 flex gap-5"
                >
                  <div
                    className="w-10 h-10 rounded-sm flex items-center justify-center shrink-0"
                    style={{
                      background: "rgba(240, 122, 48, 0.08)",
                      border: "1px solid rgba(240, 122, 48, 0.15)",
                    }}
                  >
                    <Icon
                      size={20}
                      style={{ color: "#F07A30" }}
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3
                      className="font-serif text-primary"
                      style={{ fontSize: "18px", lineHeight: "1.3" }}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className="font-mono text-muted"
                      style={{ fontSize: "14px", lineHeight: "1.7" }}
                    >
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </AnimateIn>

        {/* FAQ Accordion */}
        <AnimateIn delay={180}>
          <div className="max-w-2xl mx-auto">
            <p
              className="font-display uppercase text-muted tracking-widest mb-6"
              style={{ fontSize: "10px", letterSpacing: "0.1em" }}
            >
              Common questions
            </p>
            <Accordion type="single" collapsible>
              {FAQ_ITEMS.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger>{item.q}</AccordionTrigger>
                  <AccordionContent>
                    <p style={{ lineHeight: "1.7" }}>{item.a}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
