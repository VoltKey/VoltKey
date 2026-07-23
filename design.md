# VoltKey — Homepage Design Specification

## 0. Brief summary

VoltKey is a unified LLM gateway: one key, routed across free and paid models, built for developers who are learning to ship AI products (not enterprise buyers). The homepage's single job: make "one key, every model, routed intelligently" felt in five seconds, then prove it with real technical credibility (code, providers, mechanics) before asking for the sign-up.

Grounding subject: the logo itself — a bolt inside a broken/interrupted ring. That break in the ring is not decorative, it's the thesis. Current doesn't flow in a closed loop, it gets redirected through the gap when the circuit is interrupted. That's routing. That's the product. Every design decision below traces back to this one image.

---

## 1. Token system

### 1.1 Color — 6 named values

| Token | Hex | Role |
|---|---|---|
| `--bg-void` | `#0A0A0B` | Page background. Near-black, not pure black — keeps sharp edges from looking like a void. |
| `--bg-surface` | `#131316` | Card/panel surface, one step up from void. |
| `--border-hairline` | `#28282D` | Default 1px edges. Sharp, not soft. |
| `--text-primary` | `#EDEAE1` | Off-white, warm-tinted (not `#FFFFFF` — pure white reads cheap against near-black). |
| `--text-muted` | `#87868C` | Cool gray — secondary text, captions, the "Key" half of the wordmark. |
| `--volt` | `#E8A33D` | The amber-gold from the logo's "Volt." The one accent. Used sparingly and always with intent (CTA, active state, the spark itself) — never as a background wash. |

Two derived utility tones (not new hues, just opacity/tint steps of the above, so the palette stays at 6 real decisions):
- `--volt-dim` — `--volt` at 14% opacity, for subtle glows and hover backgrounds
- `--border-active` — `--volt` at 40% opacity, for a hairline that's mid-spark

**Explicitly avoided per brief**: no purple-to-blue gradient, no cream/terracotta pairing, no pure black (`#000`) or pure white (`#FFF`) as flat fields.

### 1.2 Typography — three roles, used unevenly on purpose

| Role | Face | Where | Weight/size notes |
|---|---|---|---|
| Primary (body, most text) | **Space Mono** | Paragraphs, nav links, buttons, code, captions, footer | Regular 400 for body, 700 only for emphasis inline — never for full headings |
| Secondary (headings) | **Libre Baskerville** | H1/H2/H3, hero headline, section titles | Regular + Italic only. Italic is reserved for the single word in a headline that needs weight (e.g. "route*d*" or "*any* model") — used at most once per section, never as a default style |
| Tertiary (least used) | **Stick No Bills** | Nav wordmark "VoltKey", section eyebrows (small caps-style labels above headings), the giant footer wordmark | Never for body copy or buttons — if it shows up more than twice above the fold, pull it back |

The pairing logic: mono body gives the page its "this is a real dev tool, not a landing-page template" credibility (matches Space Mono's technical register); Libre Baskerville headings cut against that expectation — an old-style serif next to a monospace terminal font is an intentional tension, not a mismatch, and it's what keeps this from reading like every other dark dev-tool site. Stick No Bills appears only where the brand needs to feel like a mark, not a sentence.

Type scale:
- H1 (hero): 64px / Libre Baskerville / 1.05 line-height
- H2 (section title): 40px / Libre Baskerville
- H3 (card title): 20px / Libre Baskerville
- Body: 16px / Space Mono / 1.7 line-height
- Caption/eyebrow: 12px / Stick No Bills / letter-spacing 0.08em / uppercase

### 1.3 Layout concept

Sharp, edge-cutting, minimal radius:
- `--radius`: 2px everywhere except the nav pill (see below) and circular elements (the bolt mark itself)
- Borders are 1px hairlines (`--border-hairline`), not shadows, doing the work of separating sections
- Grid: 12-column, gutters tight (24px), content max-width 1200px, generous outer margin so the sharp edges don't feel cramped against the viewport
- No card ever gets a drop shadow. Depth comes from `--bg-surface` vs `--bg-void` contrast and hairline borders only

ASCII wireframe, full page:

```
┌──────────────────────────────────────────────────┐
│  [glass nav — fixed, blurred]                     │
├──────────────────────────────────────────────────┤
│                                                    │
│         HERO — headline, subhead, 2 CTAs          │
│         circuit-trace animation behind text        │
│                                                    │
├──────────────────────────────────────────────────┤
│  THE BREAK IN THE RING — how routing works        │
│  [asymmetric: left copy 40% | right live diagram 60%] │
├──────────────────────────────────────────────────┤
│  FEATURES — bento grid (1 large + 4 small, uneven)│
├──────────────────────────────────────────────────┤
│  PROVIDERS — logo rail, marquee or static grid    │
├──────────────────────────────────────────────────┤
│  INTEGRATION — code block, "swap one line" moment │
├──────────────────────────────────────────────────┤
│  LIVE COUNTER — requests routed (ticking, honest) │
├──────────────────────────────────────────────────┤
│  CTA BAND — get your key                          │
├──────────────────────────────────────────────────┤
│  FOOTER — about / company / contact columns       │
├──────────────────────────────────────────────────┤
│         V O L T K E Y  (giant, cropped, 6% opacity)│
└──────────────────────────────────────────────────┘
```

### 1.4 Signature element

**The interrupted circuit.** A thin animated trace (1px, `--volt` at full opacity with a soft `--volt-dim` glow trail) that runs along hairline borders — nav underside, card edges, the divider lines between sections — and at the exact point where the logo's ring has its gap, the trace visibly jumps the gap and re-enters at an angle, rather than completing the circle. This one motion idea is reused everywhere current would visually travel: hero background, hover states on cards, the "how it works" diagram, even the loading state on the CTA button. It's the same gesture as the logo, animated, and it's a literal enactment of what the product does — current forced to reroute rather than complete its expected loop.

This is the one place the design spends its boldness. Everything else stays quiet and disciplined around it.

---

## 2. Navbar — glassmorphism

- Fixed, full-width, `backdrop-filter: blur(16px)`, background `rgba(10,10,11,0.55)`, bottom border `1px solid --border-hairline`
- This is the **only** glass surface on the page — glassmorphism is reserved entirely for the nav, so it reads as a deliberate frame rather than a texture repeated everywhere
- Left: bolt mark (24px) + "VoltKey" in Stick No Bills, `--text-primary`
- Center: `Docs` · `Models` · `Pricing` · `Changelog` — Space Mono, `--text-muted`, hover shifts to `--text-primary` with the circuit-trace briefly sparking under the hovered item only
- Right: `Log in` (ghost, text-only) and `Get API key` (filled `--volt` background, `--bg-void` text, radius 2px, sharp corners — the one filled-amber surface in the nav)
- Radius exception: the navbar's own outer container may use a very slight 8px radius if it's inset from the viewport edge (floating-pill style, à la Linear); if it's full-bleed edge-to-edge instead, radius is 0. Pick one — don't do both.

---

## 3. Hero

- Eyebrow (Stick No Bills, small, `--volt`): `ROUTE ANYTHING · MISS NOTHING`
- H1 (Libre Baskerville, 64px): "One key. Every model. **Never** waiting on a limit." — the single italicized word is "Never," not a repeated tic
- Subhead (Space Mono, `--text-muted`, 18px): one sentence, plain register — "Free-tier and your own provider keys, routed through one endpoint that fails over before you notice."
- Two CTAs, side by side, unequal visual weight:
  - Primary: `Get API key` — filled `--volt`, sharp corners, subtle glow on hover (the circuit trace runs along its border loop on hover, jumping the same gap as the logo)
  - Secondary: `Explore models →` — ghost button, hairline border only, arrow shifts right 2px on hover
- Background: `--bg-void`, with the circuit-trace animation running faint and slow behind the headline — thin traced lines suggesting a PCB layout, mostly still, with one trace actively "live" (animated) at a time so it reads as ambient rather than busy
- No hero image, no product screenshot mockup up front — the circuit trace *is* the hero visual, not a placeholder for one

---

## 4. Section: "The break in the ring" (how it works)

Avoid the 3-card generic layout entirely here — this is the section most tempted toward it, so it's the one to be most deliberate about.

Layout: asymmetric split, 40/60.
- **Left (40%)**: short copy block explaining the mechanic in plain terms — one paragraph, Space Mono, no bullet list. E.g.: "A request comes in on your key. VoltKey checks which provider is fastest and healthy right now, sends it there, and if that provider rate-limits or times out mid-request, reroutes before you'd notice — same key, same code, no retry logic on your end."
- **Right (60%)**: a live, looping SVG/canvas diagram — nodes for 3-4 provider logos (Groq, Gemini, OpenAI, Anthropic) connected by traces to a central "VoltKey" node, with the animated spark traveling from user → VoltKey node → whichever provider is "active" in the loop, occasionally showing a trace go dim (rate-limited) and the spark visibly rerouting to the next node. This is functional storytelling, not decoration — it shows the product's actual mechanic.

No numbered steps (01/02/03) — there's no sequence here, it's a live decision each request, and numbering it would misrepresent that as a fixed pipeline.

---

## 5. Section: Features — bento grid, not a 3-card grid

Explicitly break the uniform-card pattern. Grid of 5 items, uneven sizes:

```
┌───────────────────────┬───────────┐
│                       │  BYOK     │
│   AUTO FAILOVER       │  bring    │
│   (large, 2x1)        │  your own │
│                       │  keys     │
├───────────┬───────────┼───────────┤
│  ANALYTICS│  STREAMING│ OPENAI-   │
│  cost/lat │  token by │ COMPATIBLE│
│  by model │  token    │ endpoint  │
└───────────┴───────────┴───────────┘
```

- Large tile gets a small live visual (a sparkline of latency, or the circuit-trace in miniature); small tiles are text-only — title (Libre Baskerville, 20px) + one line of Space Mono body, no icon set that could read as generic (avoid a uniform icon-in-circle treatment across all five; if icons are used at all, vary their treatment or skip them entirely in favor of the type doing the work)
- Hairline borders between tiles only — no individual card shadows or backgrounds distinct from `--bg-surface`

---

## 6. Section: Providers

- A static row (not an auto-scrolling marquee — those read as filler) of provider wordmarks/logos in grayscale, `--text-muted`, brightening to full color only on hover
- Small label above, Stick No Bills eyebrow: `ROUTES ACROSS`
- Deliberately not a "trusted by" framing (VoltKey doesn't need social proof language here) — it's a capability list, framed plainly

---

## 7. Section: Integration — the code moment

- Dark code block (slightly darker than `--bg-surface`, `#0D0D0F`), Space Mono, syntax highlighting limited to `--volt` for keywords/strings and `--text-muted` for comments — no rainbow syntax theme
- Shows the actual "swap the base_url" moment from the real architecture — e.g.:
```python
client = OpenAI(
    base_url="https://api.voltkey.dev/v1",
    api_key="sk-voltkey-..."
)
```
- Caption beneath, plain: "Any OpenAI SDK. Any language. One line changes."
- This section is a credibility anchor for the exact audience (developers who read code faster than they read marketing copy) — don't over-decorate it

---

## 8. Section: Live counter (optional, use only if the number is real)

- A single honest stat, not a fake animated-up counter with invented precision: "X requests routed today" or similar, sourced from real usage once there is any
- If there's no real data yet at launch, cut this section entirely rather than fabricate a number — a placeholder stat undermines the exact trust this audience is choosing you for

---

## 9. CTA band

- Full-width, `--bg-surface`, centered content
- H2 (Libre Baskerville): "Stop juggling five free tiers."
- One CTA: `Get API key` (same treatment as hero primary)
- The circuit-trace runs the full width of this band's top border, slow and ambient

---

## 10. Footer

Standard three/four-column structure, real company footer register (not a dev-tool afterthought):

| About | Company | Resources | Contact |
|---|---|---|---|
| One-line mission statement | Careers, Blog | Docs, Changelog, Status | Contact us, Twitter/X, GitHub |

- Space Mono throughout, `--text-muted` links brightening to `--text-primary` on hover, no `--volt` in footer body text (keep the accent reserved for actions, not everywhere)
- Bottom row: small bolt mark + copyright line, hairline top border

---

## 11. Post-footer: the giant wordmark

- Directly beneath the footer, before the page ends: `VOLTKEY` set in Stick No Bills, massive scale (font-size roughly 30-40% of viewport width), color `--text-primary` at **6% opacity**, letter-spacing tightened
- Cropped so only the top ~50-55% of the letterforms is visible — the bottom half runs off the viewport edge with no fade/gradient mask needed, a hard crop is more in keeping with the sharp-edge visual language than a soft fade-out would be
- No interaction, no hover state — this is purely a closing visual beat, the brand as a monument rather than a UI element

---

## 12. Motion and animation spec

- **Page load**: the bolt mark in the nav "strikes" once on load (a quick 200ms flash along its own path), then the ambient hero circuit-trace begins its slow loop. One orchestrated moment, not a cascade of fade-ins on every element.
- **Scroll-triggered**: sections fade/rise in lightly (12px translate, 400ms, ease-out) — restrained, not staggered per-word or per-character
- **Hover micro-interactions**: card edges spark (the circuit-trace runs the hairline border once) on hover, buttons get the same treatment plus a `--volt-dim` glow bloom
- **Ambient**: only one trace is ever "live"/animated at a time per section — multiple simultaneous moving sparks read as busy/AI-generated-feeling rather than deliberate
- **Reduced motion**: all circuit-trace animation and scroll-reveals must respect `prefers-reduced-motion` — fall back to static hairline borders at `--border-active` opacity and instant section appearance, no exceptions

---

## 13. What this design deliberately avoids (recap, confirm before build)

- No purple-to-blue gradient anywhere
- No Inter, no default system sans as a primary face
- No cream background + terracotta accent pairing
- No 01/02/03 numbered markers (no section here is a true fixed sequence)
- No uniform 3-card feature grid (bento layout instead)
- No pure `#000`/`#FFF` flat fields
- No drop shadows for depth — hairlines and surface-contrast only
- No auto-scrolling logo marquee
- No fabricated stats

---

## 14. Accessibility floor (non-negotiable regardless of aesthetic)

- All text meets WCAG AA contrast against its background (`--text-muted` on `--bg-void` needs checking at final values — adjust lightness if it falls short, don't skip the check for the sake of the palette)
- Visible keyboard focus rings on every interactive element (a `--volt` outline, 2px, offset 2px — the one place an outline is expected, not decorative)
- All animation respects `prefers-reduced-motion` as specified above
- Code block content remains selectable/copyable, not rendered as an image
