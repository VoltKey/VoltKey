import type { Metadata } from "next";
import { Space_Mono, Libre_Baskerville, Stick_No_Bills } from "next/font/google";
import "./globals.css";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-libre-baskerville",
  display: "swap",
});

const stickNoBills = Stick_No_Bills({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-stick-no-bills",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VoltKey — One key. Every model. Never waiting on a limit.",
  description:
    "Free-tier and your own provider keys, routed through one endpoint that fails over before you notice. The unified LLM gateway for developers shipping AI products.",
  keywords: ["LLM gateway", "AI routing", "OpenAI compatible", "API key", "model routing"],
  openGraph: {
    title: "VoltKey — One key. Every model.",
    description:
      "Unified LLM gateway. One key, routed across free and paid models with automatic failover.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceMono.variable} ${libreBaskerville.variable} ${stickNoBills.variable}`}
    >
      <body className="bg-void text-primary font-mono antialiased">
        {children}
      </body>
    </html>
  );
}
