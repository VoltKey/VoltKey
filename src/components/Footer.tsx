"use client";

import Link from "next/link";
import { BoltMark } from "./BoltMark";
import { Separator } from "./ui/separator";

const FOOTER_COLS = [
  {
    heading: "About",
    links: [
      { label: "How It Works", href: "#how-it-works" },
      { label: "Features", href: "#features" },
      { label: "Integration", href: "#integration" },
      { label: "Security", href: "#security" },
    ],
    intro:
      "The unified LLM gateway for developers who are learning to ship AI products.",
  },
  {
    heading: "Connect",
    links: [
      { label: "Twitter / X", href: "https://x.com/voltkey_dev" },
      { label: "GitHub", href: "https://github.com/voltkey-dev" },
      { label: "Discord", href: "https://discord.gg/voltkey" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <footer
      className="border-t"
      style={{ borderColor: "#28282D", background: "#0A0A0B" }}
      aria-label="Site footer"
    >
      <div className="max-w-content mx-auto px-6 pt-16 pb-8">
        {/* Main columns — 2 columns instead of 4 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 mb-16">
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
                  style={{
                    fontSize: "13px",
                    lineHeight: "1.7",
                    opacity: 0.7,
                  }}
                >
                  {col.intro}
                </p>
              )}
              <nav
                className="flex flex-col gap-2.5"
                aria-label={`${col.heading} links`}
              >
                {col.links.map(({ label, href }) => {
                  const isExternal = href.startsWith("http");
                  const isAnchor = href.startsWith("#");
                  return (
                    <Link
                      key={label}
                      href={href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      onClick={
                        isAnchor
                          ? (e: React.MouseEvent<HTMLAnchorElement>) =>
                              handleAnchorClick(e, href)
                          : undefined
                      }
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
        <Separator className="mb-8" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
