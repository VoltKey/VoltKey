interface BoltMarkProps {
  size?: number;
  className?: string;
  color?: string;
}

/**
 * VoltKey brand mark — the interrupted ring, faithful to the logo.
 * Two concentric arcs with a break at the ~3 o'clock position.
 */
export function BoltMark({ size = 24, className = "", color = "currentColor" }: BoltMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer ring — break at ~3:30 o'clock, 330° arc */}
      <path
        d="M 92 62 A 44 44 0 1 1 94 50"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Inner ring — same break orientation, 320° arc */}
      <path
        d="M 74 62 A 26 26 0 1 1 76 50"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
