import { AnimateIn } from "./AnimateIn";

/**
 * Provider wordmarks in grayscale, brighten on hover.
 * Deliberately not a marquee — static grid, capability framing.
 */

function ProviderLogo({
  name,
  description,
}: {
  name: string;
  description: string;
}) {
  return (
    <div
      className="provider-logo flex flex-col items-center justify-center gap-2 py-4 px-6 cursor-default"
      title={description}
      aria-label={name}
    >
      <span
        className="font-mono font-bold tracking-tight"
        style={{ fontSize: "15px", color: "#87868C" }}
      >
        {name}
      </span>
    </div>
  );
}

const PROVIDERS = [
  { name: "OpenAI", description: "GPT-4o, GPT-4 Turbo, GPT-3.5" },
  { name: "Anthropic", description: "Claude 3.5 Sonnet, Claude 3 Opus, Haiku" },
  { name: "Groq", description: "Llama 3, Mixtral — fastest inference" },
  { name: "Gemini", description: "Google Gemini 1.5 Pro, Flash" },
  { name: "Mistral", description: "Mistral Large, 8x7B" },
  { name: "Together AI", description: "Open-source model hosting" },
  { name: "Perplexity", description: "Sonar models with search" },
  { name: "Cohere", description: "Command R+, Embed" },
];

export function Providers() {
  return (
    <section
      id="providers"
      className="border-t"
      style={{ borderColor: "#28282D" }}
      aria-labelledby="providers-heading"
    >
      <div className="max-w-content mx-auto px-6 py-20">
        <AnimateIn>
          <p
            id="providers-heading"
            className="font-display uppercase text-muted tracking-widest mb-8 text-center"
            style={{ fontSize: "11px", letterSpacing: "0.1em" }}
          >
            Routes across
          </p>
        </AnimateIn>

        <AnimateIn delay={60}>
          <div
            className="grid grid-cols-4 md:grid-cols-8 divide-x divide-hairline"
            style={{
              border: "1px solid #28282D",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            {PROVIDERS.map((p) => (
              <div
                key={p.name}
                style={{ borderColor: "#28282D" }}
              >
                <ProviderLogo {...p} />
              </div>
            ))}
          </div>
        </AnimateIn>

        <AnimateIn delay={100}>
          <p
            className="font-mono text-muted text-center mt-6"
            style={{ fontSize: "12px", opacity: 0.5 }}
          >
            More providers added regularly · Request a provider via GitHub
          </p>
        </AnimateIn>
      </div>
    </section>
  );
}
