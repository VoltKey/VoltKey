import Link from "next/link";
import { BoltMark } from "./BoltMark";

const FOOTER_COLS = [
  {
    heading: "About",
    links: [
      { label: "Mission", href: "/about" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Security", href: "/security" },
    ],
    intro: "The unified LLM gateway for developers who are learning to ship AI products.",
  },
  {
    heading: "Company",
    links: [
      { label: "Careers", href: "/careers" },
      { label: "Blog", href: "/blog" },
      { label: "Legal", href: "/legal" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Docs", href: "/docs" },
      { label: "Changelog", href: "/changelog" },
      { label: "Status", href: "/status" },
      { label: "Models", href: "/models" },
    ],
  },
  {
    heading: "Contact",
    links: [
      { label: "Contact us", href: "/contact" },
      { label: "Twitter / X", href: "https://x.com/voltkey_dev" },
      { label: "GitHub", href: "https://github.com/voltkey-dev" },
      { label: "Discord", href: "https://discord.gg/voltkey" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t"
      style={{ borderColor: "#28282D", background: "#0A0A0B" }}
      aria-label="Site footer"
    >
      <div className="max-w-content mx-auto px-6 pt-16 pb-8">
        {/* Main columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          {FOOTER_COLS.map((col) => (
            <div key={col.heading} className="flex flex-col gap-4">
              <h3
                className="font-display uppercase tracking-widest text-muted"
                style={{ fontSize: "10px", letterSpacing: "0.1em" }}
              >
                {col.heading}
              </h3>
              {col.intro && (
                <p
                  className="font-mono text-muted"
                  style={{ fontSize: "13px", lineHeight: "1.7", opacity: 0.7 }}
                >
                  {col.intro}
                </p>
              )}
              <nav className="flex flex-col gap-2.5" aria-label={`${col.heading} links`}>
                {col.links.map(({ label, href }) => {
                  const isExternal = href.startsWith("http");
                  return (
                    <Link
                      key={label}
                      href={href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      className="font-mono text-muted hover:text-primary transition-colors duration-200"
                      style={{ fontSize: "13px" }}
                    >
                      {label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8"
          style={{ borderTop: "1px solid #28282D" }}
        >
          <div className="flex items-center gap-2.5">
            <BoltMark size={16} color="#87868C" />
            <span
              className="font-mono text-muted"
              style={{ fontSize: "12px" }}
            >
              © {year} VoltKey. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-6">
            {[
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
              { label: "Cookies", href: "/cookies" },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="font-mono text-muted hover:text-primary transition-colors duration-200"
                style={{ fontSize: "12px" }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
