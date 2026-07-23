"use client";

import { useEffect, useRef, useState } from "react";

interface AnimateInProps {
  children: React.ReactNode;
  className?: string;
  /** Delay in ms before the reveal transition starts after entering viewport */
  delay?: number;
}

/**
 * Scroll-triggered fade + 12px rise, 400ms ease-out.
 * Respects prefers-reduced-motion — falls back to instant reveal.
 * Delay is handled entirely in JS so CSS transitionDelay doesn't double it.
 */
export function AnimateIn({ children, className = "", delay = 0 }: AnimateInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) {
      setVisible(true);
      return;
    }

    let timer: ReturnType<typeof setTimeout>;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [delay]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        // Only apply transition once visible triggers — avoids flash on initial paint
        transition: visible
          ? "opacity 400ms ease-out, transform 400ms ease-out"
          : "none",
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
