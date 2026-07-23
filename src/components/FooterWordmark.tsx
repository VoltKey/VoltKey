/**
 * Post-footer giant wordmark.
 * "VOLTKEY" in Stick No Bills at ~30–35vw font-size.
 * 6% opacity, only top ~52% of letters visible — hard crop, no gradient.
 * No interaction. A closing visual beat — the brand as monument.
 */
export function FooterWordmark() {
  return (
    <div
      aria-hidden="true"
      style={{
        background: "#0A0A0B",
        overflow: "hidden",
        // Show top ~52% of the characters
        height: "12vw",
        userSelect: "none",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-stick-no-bills), sans-serif",
          fontSize: "clamp(4rem, 22vw, 22vw)",
          fontWeight: 700,
          color: "#EDEAE1",
          opacity: 0.06,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          whiteSpace: "nowrap",
          // Center horizontally so the crop feels balanced
          textAlign: "center",
          // Small downward offset so only the top of the letters shows
          paddingTop: "0.5vw",
        }}
      >
        VOLTKEY
      </div>
    </div>
  );
}
