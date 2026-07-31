# VoltKey — Homepage Design Specification (v2)

## 0. Brief summary

VoltKey is a unified LLM gateway: one key, routed across free and paid models, built for developers who are learning to ship AI products (not enterprise buyers). The homepage's single job: make "one key, every model, routed intelligently" felt in five seconds, then prove it with real technical credibility (code, providers, mechanics) before asking for the sign-up.

Grounding subject: the logo itself — a bolt inside a broken/interrupted ring. That break in the ring is not decorative, it's the thesis. Current doesn't flow in a closed loop, it gets redirected through the gap when the circuit is interrupted. That's routing. That's the product. Every design decision below traces back to this one image.

**v2 direction**: more minimal, more modern. Fewer columns, more whitespace, bolder accent (shifted from amber-gold to warm orange), lightning bolt effects layered alongside the existing circuit-trace motif. Navigation anchors to page sections instead of separate routes. Simplified footer. New Mission and Security sections.

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
| `--volt` | `#F07A30` | Warm orange — the "volt" accent. Shifted from the original amber-gold to a more energetic, orange tone. Used sparingly and always with intent (CTA, active state, lightning effects) — never as a background wash. |

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
- **v2 emphasis**: more negative space between sections. Let the page breathe.

ASCII wireframe, full page:

```
┌──────────────────────────────────────────────────┐
│  [glass nav — fixed, blurred, anchor links]       │
├──────────────────────────────────────────────────┤
│                                                    │
│         HERO — headline, subhead, 2 CTAs          │
│         lightning bolt + circuit-trace behind text  │
│                                                    │
├──────────────────────────────────────────────────┤
│  MISSION — 3-card grid: purpose, values, promise  │
├──────────────────────────────────────────────────┤
│  THE BREAK IN THE RING — how routing works        │
│  [asymmetric: left copy 40% | right live diagram] │
├──────────────────────────────────────────────────┤
│  FEATURES — bento grid (1 large + 4 small)        │
├──────────────────────────────────────────────────┤
│  PROVIDERS — logo rail, static grid               │
├──────────────────────────────────────────────────┤
│  INTEGRATION — code block, "swap one line" moment │
├──────────────────────────────────────────────────┤
│  SECURITY — encryption, key isolation, compliance │
├──────────────────────────────────────────────────┤
│  CTA BAND — get your key                          │
├──────────────────────────────────────────────────┤
│  FOOTER — simplified: About + Connect, 2 columns  │
├──────────────────────────────────────────────────┤
│         V O L T K E Y  (giant, cropped, 6% opacity)│
└──────────────────────────────────────────────────┘
```

### 1.4 Signature elements

**The interrupted circuit.** A thin animated trace (1px, `--volt` at full opacity with a soft `--volt-dim` glow trail) that runs along hairline borders — nav underside, card edges, the divider lines between sections — and at the exact point where the logo's ring has its gap, the trace visibly jumps the gap and re-enters at an angle. This one motion idea is reused everywhere current would visually travel: hero background, hover states on cards, the "how it works" diagram, even the loading state on the CTA button.

**The lightning bolt.** New in v2. A stylized bolt SVG that strikes once on page load in the hero (dramatic 300ms flash with glow bloom), then settles into a subtle ambient flicker. The bolt appears as a decorative accent in section eyebrows and nav hover states. It reinforces the "voltage/energy" brand alongside the circuit-trace — the bolt is the energy, the trace is the pathway it travels.

---

## 2. Navbar — glassmorphism + section anchors

- Fixed, full-width, `backdrop-filter: blur(16px)`, background `rgba(10,10,11,0.55)`, bottom border `1px solid --border-hairline`
- This is the **only** glass surface on the page
- Left: bolt mark (24px) + "VoltKey" in Stick No Bills, `--text-primary`
- Center: `How It Works` · `Features` · `Integration` · `Security` — Space Mono, `--text-muted`, hover shifts to `--text-primary` with a small lightning bolt icon appearing
  - These are anchor links scrolling to `#how-it-works`, `#features`, `#integration`, `#security`
  - Smooth scroll behavior via `scroll-behavior: smooth` and JS `scrollIntoView`
- Right: `Log in` (ghost, text-only) and `Get API key` (filled `--volt` background)
- Mobile: hamburger menu that slides open with the same anchor links
- Auth links remain route-based (`/auth/login`, `/auth/signup`, `/dashboard`)

---

## 3. Hero

- Eyebrow (shadcn Badge, variant outline, `--volt` border): `ROUTE ANYTHING · MISS NOTHING`
- H1 (Libre Baskerville, 64px): "One key. Every model. **Never** waiting on a limit."
- Subhead (Space Mono, `--text-muted`, 18px): one sentence, plain
- Two CTAs, side by side
- Background: PCB circuit-trace (existing), plus a central lightning bolt SVG that strikes on load
- Lightning bolt: ~200px tall, centered behind the headline, strikes once (300ms) then holds at 8% opacity with subtle glow

---

## 4. Section: Mission (NEW)

- `id="mission"`, eyebrow: `OUR MISSION`
- H2: "Built for builders. Not for billing departments."
- Brief paragraph about VoltKey's purpose
- Three shadcn Card components in a row:
  1. **Developer-First**: "One API key, zero complexity. We build for developers shipping real products."
  2. **Open Access**: "Route across free tiers and your own keys. The best model for each request, not the most expensive."
  3. **Intelligent Routing**: "Automatic failover, latency-aware selection. Your requests always find the fastest path."
- Cards use `--bg-surface` background, hairline borders, no shadows

---

## 5. Section: "The break in the ring" (how it works)

Same as v1 with `id="how-it-works"` added, updated colors.

---

## 6. Section: Features — bento grid

Same as v1 with `id="features"` added, updated colors.

---

## 7. Section: Providers

Same as v1 with `id="providers"` added, updated colors.

---

## 8. Section: Integration — the code moment

Same as v1 with `id="integration"` added, updated colors.

---

## 9. Section: Security (NEW)

- `id="security"`, eyebrow: `SECURITY`
- H2: "Your keys. Your data. Our obsession."
- Grid of 4 security features with lightning bolt shield accents:
  1. **End-to-End Encryption**: "All API traffic is encrypted in transit via TLS 1.3. Keys are encrypted at rest with AES-256."
  2. **Zero Data Logging**: "We route your requests. We don't read them. No prompt logging, no training data collection."
  3. **Key Isolation**: "Each user's provider keys are stored in isolated, encrypted vaults. No shared credential pools."
  4. **Compliance Path**: "Building toward SOC 2 Type II. Security isn't an afterthought — it's the infrastructure."
- shadcn Accordion below for expandable FAQ-style security details

---

## 10. CTA band

Same as v1 with updated colors.

---

## 11. Footer (simplified)

Two-column layout instead of four:

| About | Connect |
|---|---|
| One-line mission + section links | Twitter/X, GitHub, Discord |

- Space Mono throughout, `--text-muted` links
- Bottom row: bolt mark + copyright
- No "Company" or "Resources" columns

---

## 12. Post-footer: the giant wordmark

Same as v1.

---

## 13. Motion and animation spec

- **Page load**: bolt mark strikes in nav (200ms), then hero lightning bolt strikes (300ms, with glow bloom), then ambient circuit-trace begins
- **Scroll-triggered**: sections fade/rise in lightly (12px translate, 400ms, ease-out)
- **Hover micro-interactions**: card edges spark, buttons glow, nav links show a small bolt icon
- **Lightning bolt ambient**: after initial strike, the hero bolt holds at 8% opacity with a slow 4s flicker cycle
- **Reduced motion**: all animation and reveals respect `prefers-reduced-motion`

---

## 14. shadcn/ui components

Used sparingly where they add genuine polish:
- **Badge**: eyebrow labels in hero and section headers
- **Card**: Mission section pillars, Security feature cards
- **Separator**: clean dividers between content blocks
- **Accordion**: Security FAQ details

These are pure client-side UI primitives. No backend dependencies. Styled to match the VoltKey token system.

---

## 15. What this design deliberately avoids (recap)

- No purple-to-blue gradient anywhere
- No Inter, no default system sans as a primary face
- No cream background + terracotta accent pairing
- No 01/02/03 numbered markers
- No uniform 3-card feature grid (bento layout instead)
- No pure `#000`/`#FFF` flat fields
- No drop shadows for depth — hairlines and surface-contrast only
- No auto-scrolling logo marquee
- No fabricated stats
- No company/resources/careers bloat in footer
- No route-based nav for page sections (anchor scroll instead)

---

## 16. Accessibility floor (non-negotiable regardless of aesthetic)

- All text meets WCAG AA contrast against its background
- Visible keyboard focus rings on every interactive element (`--volt` outline, 2px, offset 2px)
- All animation respects `prefers-reduced-motion`
- Code block content remains selectable/copyable
- Anchor navigation works with keyboard
- Mobile menu is accessible via button with aria-expanded
