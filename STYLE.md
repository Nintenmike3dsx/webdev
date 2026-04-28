# STYLE.md — Nano TCG Castle Site

Design tokens and visual rules. Every value here is the source of truth. Component CSS must reference tokens by `var(--name)` — never raw hex codes or pixel literals (the only exception is `0`, `1px` borders, and `100%`).

## Palette: Stone & Gold

Defined as CSS custom properties on `:root` in `css/main.css`.

| Token | Value | Usage |
|---|---|---|
| `--color-stone` | `#3A3A3A` | Page background base, castle walls |
| `--color-stone-dark` | `#1F1F1F` | Modal scrim, deep shadows |
| `--color-stone-light` | `#5C5C5C` | Borders on dark surfaces, dividers |
| `--color-parchment` | `#F4E9D1` | Card faces, content panels, primary readable surfaces |
| `--color-parchment-dim` | `#D9CCAE` | Hover state on parchment surfaces |
| `--color-gold` | `#C9A24B` | Primary accent, CTAs, headings, frame trim |
| `--color-gold-bright` | `#E8C76B` | Hover/active state on gold elements |
| `--color-blood` | `#7A1F1F` | Danger, "remove from deck", `attack` stat on Character cards |
| `--color-forest` | `#2E4A2B` | Confirm, "added", `defense` stat on Character cards |
| `--color-treat` | `#B07A2A` | `treatCost` badges, treat-curve rack on the deck-builder |
| `--color-ink` | `#1A1310` | Body text on parchment |
| `--color-ink-muted` | `#5C4A3A` | Secondary text, captions |
| `--color-bone` | `#EFE6D2` | Off-white text on dark surfaces |

**Contrast rules.** Body text on parchment uses `--color-ink` (passes WCAG AA at 14px). Body text on stone uses `--color-bone`. Gold is for accents only — never use `--color-gold` for body copy.

## Typography

Loaded via `<link>` to Google Fonts in every HTML file's `<head>`.

| Token | Family | Source |
|---|---|---|
| `--font-display` | `'Cinzel', 'Times New Roman', serif` | Google Fonts: Cinzel 400, 600, 700 |
| `--font-body` | `'Inter', system-ui, sans-serif` | Google Fonts: Inter 400, 500, 700 |
| `--font-mono` | `'IBM Plex Mono', ui-monospace, monospace` | Google Fonts: IBM Plex Mono 400, 600 |

**Use:**

- `--font-display` — page titles, card names, section headers, button labels.
- `--font-body` — paragraphs, list items, modal copy.
- `--font-mono` — numeric stats on cards, deck-builder counts, prices.

### Type scale

| Token | Size | Line height | Use |
|---|---|---|---|
| `--fs-hero` | `clamp(2.5rem, 6vw, 4.5rem)` | `1.05` | Hero headlines |
| `--fs-h1` | `clamp(2rem, 4vw, 3rem)` | `1.15` | Page H1 |
| `--fs-h2` | `clamp(1.5rem, 3vw, 2.25rem)` | `1.2` | Section headers |
| `--fs-h3` | `1.25rem` | `1.3` | Card names, modal headers |
| `--fs-body` | `1rem` | `1.55` | Body copy |
| `--fs-small` | `0.875rem` | `1.4` | Captions, helper text |
| `--fs-stat` | `1.125rem` | `1` | Card stats, monospace |

Body default: `font-family: var(--font-body); font-size: var(--fs-body); color: var(--color-ink);` on a parchment surface.

## Spacing

8-px grid. Use these tokens for every margin, padding, and gap. No raw px values in component CSS.

| Token | Value |
|---|---|
| `--space-0` | `0` |
| `--space-1` | `0.25rem` (4px) |
| `--space-2` | `0.5rem` (8px) |
| `--space-3` | `0.75rem` (12px) |
| `--space-4` | `1rem` (16px) |
| `--space-6` | `1.5rem` (24px) |
| `--space-8` | `2rem` (32px) |
| `--space-12` | `3rem` (48px) |
| `--space-16` | `4rem` (64px) |
| `--space-24` | `6rem` (96px) |

## Radii, borders, shadows

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | `4px` | Buttons, input fields |
| `--radius-md` | `8px` | Cards, modal corners |
| `--radius-lg` | `16px` | Hero panels, banners |
| `--border-thin` | `1px solid var(--color-stone-light)` | Default dividers |
| `--border-gold` | `2px solid var(--color-gold)` | Card frames, CTA outlines |
| `--shadow-soft` | `0 2px 6px rgba(0,0,0,0.25)` | Hovered cards, raised panels |
| `--shadow-deep` | `0 8px 24px rgba(0,0,0,0.45)` | Modals, opened pack reveal |

## Layout

- Mobile-first. Default styles target the smallest viewport.
- Container max-width: `--max-w: 1200px`, centered with `margin-inline: auto` and `padding-inline: var(--space-6)`.
- Grid: card grid uses `grid-template-columns: repeat(auto-fill, minmax(180px, 1fr))` with `gap: var(--space-4)`.

### Breakpoints

| Token | Min width | Use |
|---|---|---|
| `--bp-sm` | `600px` | Tablet portrait — two-column grids start here |
| `--bp-md` | `900px` | Tablet landscape / small laptop — sidebar layouts |
| `--bp-lg` | `1200px` | Desktop — full multi-column hero |

In CSS, write breakpoints as `@media (min-width: 600px)` etc. The tokens are documentation; CSS does not yet support custom properties inside `@media` queries.

## Z-index scale

Avoid arbitrary z-index values. Pick a token.

| Token | Value | Use |
|---|---|---|
| `--z-base` | `0` | Default |
| `--z-raised` | `10` | Hover-lifted card |
| `--z-sticky` | `100` | Sticky nav |
| `--z-modal` | `1000` | Modals, pack-opening overlay |
| `--z-toast` | `2000` | Toasts, error banners |

## Castle metaphor — visual treatments

The site reads as a castle. Apply these consistently:

- **Page backgrounds**: each page has a background image evoking its room (main hall, library, armory, battlefield). Files live at `img/ui/bg-<page>.png`. While art is missing, fall back to `background-color: var(--color-stone)` plus a subtle `linear-gradient` from `--color-stone-dark` to `--color-stone`.
- **Frames**: panels and cards use `--border-gold` corners. Optional ornamental SVG corners live at `img/ui/corner-tl.svg` etc., applied as `background-image` on the four corners (no extra DOM nodes).
- **Buttons**: gold-on-stone with `--font-display`, uppercase, letter-spacing `0.08em`. Hover swaps to `--color-gold-bright` plus `--shadow-soft`.
- **Nav**: image-driven where possible. Text labels remain present for screen readers (`aria-label`) and for users with images disabled.

## Animation rules

- All non-decorative motion respects `prefers-reduced-motion: reduce`. Disable transforms and opacity transitions when reduce is set.
- Standard transition: `transition: transform 200ms ease-out, box-shadow 200ms ease-out;`
- Card hover (Book of Cards): `transform: translateY(-6px) rotate(-1deg); box-shadow: var(--shadow-soft);`
- Pack opening (shop): a multi-step CSS keyframe animation in `css/components/animations.css` — wax seal cracks, cards fan out. Total length ≤ 1200ms.
- Demo battle (play page): card-play animations are CSS transforms triggered by JS class swaps. No JS animation libraries.
- Page transitions: a quick 250ms fade-and-zoom between castle rooms is welcome but optional. If implemented, use the View Transitions API behind a feature check.

## Accessibility (non-negotiable)

- Every image has meaningful `alt` text or `alt=""` if purely decorative.
- Color is never the only signal. "Out of stock", "selected in deck", and "low health" each pair color with text or an icon.
- Focus styles are visible: a `2px` `--color-gold-bright` outline with `2px` offset on `:focus-visible`. Do not remove default outlines without replacing them.
- Modals trap focus and close on Escape.
- The "Accept Nano Treats" cookie modal is dismissible by keyboard.

## Asset placeholder rule

Until real art arrives, use `img/placeholders/<name>.png` (a flat-color PNG sized to spec) **or** an inline SVG `<rect>` with the asset name as `<title>`. Never use Lorem Ipsum-style stock images, never reference CDN images outside this site.
