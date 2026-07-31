import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        void: "#0A0A0B",
        surface: "#131316",
        hairline: "#28282D",
        primary: "#EDEAE1",
        muted: "#87868C",
        volt: "#F07A30",
      },
      fontFamily: {
        mono: ["var(--font-space-mono)", "ui-monospace", "monospace"],
        serif: ["var(--font-libre-baskerville)", "ui-serif", "Georgia", "serif"],
        display: ["var(--font-stick-no-bills)", "ui-sans-serif", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "2px",
        sm: "2px",
        md: "2px",
        lg: "2px",
        xl: "2px",
        none: "0px",
        full: "9999px",
      },
      maxWidth: {
        content: "1200px",
      },
      fontSize: {
        "hero": ["64px", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "h2": ["40px", { lineHeight: "1.15" }],
        "h3": ["20px", { lineHeight: "1.3" }],
        "eyebrow": ["12px", { lineHeight: "1.5", letterSpacing: "0.08em" }],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
