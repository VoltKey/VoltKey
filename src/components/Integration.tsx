import { AnimateIn } from "./AnimateIn";

/**
 * The "swap the base_url" code moment.
 * Space Mono, limited syntax colors: --volt for strings/keywords, --text-muted for comments.
 * No rainbow syntax theme. Content is selectable/copyable — not an image.
 */

function CodeLine({
  children,
  indent = 0,
}: {
  children: React.ReactNode;
  indent?: number;
}) {
  return (
    <div style={{ paddingLeft: `${indent * 16}px` }} className="leading-relaxed">
      {children}
    </div>
  );
}

function Kw({ children }: { children: React.ReactNode }) {
  return <span style={{ color: "#F07A30" }}>{children}</span>;
}

function Str({ children }: { children: React.ReactNode }) {
  return <span style={{ color: "#F07A30" }}>{children}</span>;
}

function Cm({ children }: { children: React.ReactNode }) {
  return <span style={{ color: "#87868C", fontStyle: "italic" }}>{children}</span>;
}

function Fn({ children }: { children: React.ReactNode }) {
  return <span style={{ color: "#EDEAE1" }}>{children}</span>;
}

function Dim({ children }: { children: React.ReactNode }) {
  return <span style={{ color: "#555558" }}>{children}</span>;
}

export function Integration() {
  return (
    <section
      id="integration"
      className="border-t"
      style={{ borderColor: "#28282D" }}
      aria-labelledby="integration-heading"
    >
      <div className="max-w-content mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── Left: copy ── */}
          <div className="flex flex-col gap-6">
            <AnimateIn>
              <p
                className="font-display uppercase text-volt tracking-widest"
                style={{ fontSize: "11px", letterSpacing: "0.1em" }}
              >
                Integration
              </p>
            </AnimateIn>

            <AnimateIn delay={60}>
              <h2
                id="integration-heading"
                className="font-serif text-primary"
                style={{ fontSize: "clamp(28px, 3.5vw, 40px)", lineHeight: "1.15" }}
              >
                One line. Every SDK.{" "}
                <em style={{ fontStyle: "italic" }}>Instant</em> coverage.
              </h2>
            </AnimateIn>

            <AnimateIn delay={120}>
              <p
                className="font-mono text-muted"
                style={{ fontSize: "15px", lineHeight: "1.75" }}
              >
                VoltKey is a drop-in replacement for the OpenAI SDK base URL.
                If your code already calls OpenAI, it already works with
                VoltKey — in any language, any framework, any runtime.
              </p>
            </AnimateIn>

            <AnimateIn delay={180}>
              <ul
                className="font-mono text-muted flex flex-col gap-3"
                style={{ fontSize: "14px" }}
              >
                {[
                  "Python · Node.js · Go · Rust · PHP · Ruby",
                  "Works with LangChain, LlamaIndex, Vercel AI SDK",
                  "Streaming, function calling, vision — all preserved",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span style={{ color: "#F07A30", marginTop: "2px" }}>
                      ·
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </AnimateIn>
          </div>

          {/* ── Right: code block ── */}
          <AnimateIn delay={80}>
            <div className="flex flex-col gap-0">
              <div
                className="code-block overflow-x-auto"
                style={{ background: "#0D0D0F" }}
              >
                {/* Tab bar */}
                <div
                  className="flex items-center gap-0 border-b px-4"
                  style={{
                    borderColor: "#28282D",
                    paddingTop: "10px",
                    paddingBottom: "10px",
                  }}
                >
                  <span
                    className="font-mono text-muted px-3 py-1"
                    style={{
                      fontSize: "12px",
                      borderBottom: "1px solid #F07A30",
                      color: "#EDEAE1",
                    }}
                  >
                    Python
                  </span>
                  <span className="font-mono text-muted px-3 py-1" style={{ fontSize: "12px" }}>
                    Node.js
                  </span>
                  <span className="font-mono text-muted px-3 py-1" style={{ fontSize: "12px" }}>
                    Go
                  </span>
                </div>

                {/* Code content */}
                <div
                  className="p-6 font-mono overflow-x-auto select-text"
                  style={{ fontSize: "13.5px", lineHeight: "1.8" }}
                >
                  <CodeLine>
                    <Cm># Before — one provider, no fallback</Cm>
                  </CodeLine>
                  <CodeLine>
                    <Dim>client = </Dim>
                    <Fn>OpenAI</Fn>
                    <Dim>(</Dim>
                  </CodeLine>
                  <CodeLine indent={1}>
                    <Dim>base_url=</Dim>
                    <Str>&quot;https://api.openai.com/v1&quot;</Str>
                    <Dim>,</Dim>
                  </CodeLine>
                  <CodeLine indent={1}>
                    <Dim>api_key=</Dim>
                    <Str>&quot;sk-proj-...&quot;</Str>
                  </CodeLine>
                  <CodeLine>
                    <Dim>)</Dim>
                  </CodeLine>

                  <div className="my-5 border-t" style={{ borderColor: "#28282D" }} />

                  <CodeLine>
                    <Cm># After — every model, automatic failover</Cm>
                  </CodeLine>
                  <CodeLine>
                    <Dim>client = </Dim>
                    <Fn>OpenAI</Fn>
                    <Dim>(</Dim>
                  </CodeLine>
                  <CodeLine indent={1}>
                    <Kw>base_url</Kw>
                    <Dim>=</Dim>
                    <Str>&quot;https://api.voltkey.dev/v1&quot;</Str>
                    <Dim>,</Dim>
                  </CodeLine>
                  <CodeLine indent={1}>
                    <Dim>api_key=</Dim>
                    <Str>&quot;sk-voltkey-...&quot;</Str>
                  </CodeLine>
                  <CodeLine>
                    <Dim>)</Dim>
                  </CodeLine>
                </div>
              </div>

              {/* Caption */}
              <p
                className="font-mono text-muted mt-4"
                style={{ fontSize: "13px", lineHeight: "1.6" }}
              >
                Any OpenAI SDK. Any language. One line changes.
              </p>

              {/* Diff highlight */}
              <div
                className="mt-6 p-4 flex items-start gap-3"
                style={{
                  background: "rgba(240,122,48,0.06)",
                  border: "1px solid rgba(240,122,48,0.2)",
                  borderRadius: "2px",
                }}
              >
                <span style={{ color: "#F07A30", fontSize: "13px" }}>→</span>
                <p className="font-mono text-muted" style={{ fontSize: "13px", lineHeight: "1.6" }}>
                  That&apos;s it. The rest of your code — completions, streaming,
                  function calls, embeddings — works unchanged.
                </p>
              </div>
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}
