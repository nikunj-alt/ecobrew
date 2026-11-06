# EcoBrew — UI/UX Pro Max Master Design System

> Generated with the UI/UX Pro Max skill (nextlevelbuilder/ui-ux-pro-max-skill).
> Direction: **Organic Craft Editorial** — premium, warm, and full of character
> (a deliberate blend of the skill's *Organic Biophilic*, *Editorial Grid/Magazine*,
> and *E-commerce Luxury* guidance), tuned to EcoBrew's upcycled tea-leaf story.

## Pattern — Scroll-Triggered Storytelling
- Narrative arc: Intro hook → Chapter 1 (the problem: chai waste) → Chapter 2
  (the journey: leaf → product) → Chapter 3 (the solution: the range) → Climax CTA.
- Each chapter has a mini CTA; the page closes on the primary CTA.
- Respect `prefers-reduced-motion`: renders each section in its final state, no parallax.
- DOM reading order stays intact.

## Style — Organic Craft Editorial
- Warm, layered surfaces; soft organic depth; editorial asymmetric grids.
- Signature elements: number/eyebrow markers, hairline rules, pull-quote moments,
  oversized serif display type, gentle natural texture (subtle grain/leaves).
- Avoid: sterile flatness, glassmorphism overload, neon gradients, generic 3-col card grids.

## Colors (warm · rich · earthy)
| Token | Hex | Role |
|-------|-----|------|
| `--color-oat` | `#FBF7EF` | Warm cream background |
| `--color-kraft` | `#F3ECDF` | Warm greige surface |
| `--color-kraft-dark` | `#E0D2BD` | Raised surface / border |
| `--color-leaf-deep` | `#1F3D2E` | Deep forest green (primary) |
| `--color-moss` | `#365A48` | Body text |
| `--color-sprout` | `#2E6B4F` | Muted forest-green accent |
| `--color-sprout-dark` | `#24583F` | Accent hover |
| `--color-tea` | `#A05A32` | Terracotta / chai accent |
| `--color-tea-light` | `#C18B63` | Accent hover / eyebrow |
| `--color-soil` | `#221A14` | Warm near-black / footer |

## Typography
- Display: **Fraunces** (editorial serif) — replace 500, tight tracking, italic accents.
- Body/UI: **Public Sans** — 400/500/600, generous line-height.
- Eyebrows/labels: uppercase, wide tracking, terracotta.

## Key Effects
- Soft organic shadows (depth without harshness).
- Rounded-biophilic radius (1.25rem) on cards and inputs; full-pill buttons (warm, friendly).
- One consistent hover language: gentle lift + slow color shift (200–300ms).
- Subtle scroll reveals (Reveal component) honoring reduced motion.

## Anti-patterns (avoid)
- Ultra-flat minimal white rectangles; heavy glassmorphism; neon/blue-purple gradients;
  emoji as icons; hover-only affordances without focus states; one duration for all motion.
