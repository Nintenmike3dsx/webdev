# Project: Nano TCG Castle Site

A vanilla-web marketing and onboarding site for **Nano**, a physical trading card game. The site teaches first-time visitors the game through visuals over text, gives them a free starter deck for signing up, lets them browse cards and build a deck, plays a short scripted demo battle, and routes purchase intent into a (display-only) shop. The single most important thing this site must do well: **make a brand-new visitor want to play Nano within 60 seconds of landing.**

The whole site is themed as a medieval castle. Each page is a different room. Navigation between pages reads as moving through the castle (e.g., the home page is the main hall, the shop is a doorway into the armory). Images, not menus, are the primary navigation affordance.

## Stack

- **HTML5, CSS3, ES2020 JavaScript only.** No React, no Vue, no jQuery, no TypeScript, no build step, no bundler, no preprocessors, no npm dependencies.
- One stylesheet split into logical partials via `@import` if needed, served as plain CSS.
- One entry script per page (`js/<page>.js`) plus shared modules in `js/lib/`. Use native ES modules (`<script type="module">`).
- Fonts: Google Fonts via `<link>` is allowed. Nothing else loaded from a third-party origin.

## Directory Layout

Anchor everything under the deploy root. Do not invent additional top-level folders.

```
/srv/csc391web/team2/AI/
├── index.html              # Home — main hall
├── learn.html              # Learn Nano — tapestry / about
├── deck.html               # Book of Cards + Deck Builder
├── play.html               # Play Nano — battlefield demo
├── shop.html               # Shop — armory
├── css/
│   ├── main.css            # tokens + layout + global components
│   ├── pages/
│   │   ├── home.css
│   │   ├── learn.css
│   │   ├── deck.css
│   │   ├── play.css
│   │   └── shop.css
│   └── components/
│       ├── card.css
│       ├── nav.css
│       ├── modal.css
│       └── animations.css
├── js/
│   ├── app.js              # bootstraps shared UI, nav, popups
│   ├── lib/
│   │   ├── storage.js      # localStorage wrapper
│   │   ├── cards.js        # fetches + indexes cards.json
│   │   ├── deck.js         # deck-builder logic
│   │   └── battle.js       # scripted demo-game state machine
│   └── pages/
│       ├── home.js
│       ├── learn.js
│       ├── deck.js
│       ├── play.js
│       └── shop.js
├── nano-data/              # card data, in-repo (do NOT rename or move)
│   ├── cards.json          # card manifest — see DATA.md
│   └── media/              # card art PNGs
│       └── *.png
├── img/
│   ├── ui/                 # castle backgrounds, frames, icons (site chrome)
│   └── placeholders/       # neutral fallback art (e.g., card-back.png)
└── video/
    └── demo.mp4            # home-page demo video (placeholder ok)
```

Card data and card art live in-repo under `nano-data/`. Treat that directory as authoritative — do not duplicate, copy, or restructure it. The `nano-data/cards.json~` editor backup and `nano-data/media/old/` directory must be ignored. See DATA.md for the full contract.

## Pages & Functionality

| Page | Route | Castle metaphor | Must do |
|---|---|---|---|
| Home | `index.html` | Main hall | Demo video, "Accept Nano Treats" cookie modal, signup CTA, three featured cards/decks linking to shop |
| Learn Nano | `learn.html` | Tapestry / library | Static lore + "what's on this site" tour. No live game data. |
| Book of Cards + Deck Builder | `deck.html` | Library scriptorium | Grid of all cards from `nano-data/cards.json`. Search + filter by `type`, `rarity`, `role`, and `treatCost`. Click-to-add into a 20-card deck (respecting each card's `cardCount` cap). Live "balance racks": treat-cost curve (bones), summed `attack` (swords), summed `defense` (shields), and Character/Action/Treat type mix (scrolls). Save/load deck to localStorage. |
| Play Nano | `play.html` | Battlefield from king's POV | Scripted 3-turn demo. Player picks a card per turn, scripted opponent responds. State machine in `js/lib/battle.js`. No backend, no AI inference. |
| Shop | `shop.html` | Armory (cards on shields) | Display-only listings. "Add to cart" persists in localStorage. Checkout shows a "Coming soon" confirmation. Free starter deck unlocks for signed-up users. |

## Scope: What Claude May Touch

**May create or modify** (everything inside the directory tree above):
- `index.html`, `learn.html`, `deck.html`, `play.html`, `shop.html`
- Anything under `css/`, `js/`, `data/`, `img/`, `video/`

**Must never touch**:
- `CLAUDE.md`, `STYLE.md`, `DATA.md`, `README.md` — constraint files. If a constraint is wrong, surface it in chat. Do not silently rewrite.
- Anything outside `/srv/csc391web/team2/AI/`.
- `.git/`, `.github/`, or any tooling config.

When unsure, ask before creating a new directory. Do not invent a `src/`, `dist/`, `node_modules/`, or `build/`.

## Data & Constraints (summary)

- **Auth**: No real authentication. Signup is a localStorage flag (`nano.user = { name, signedUpAt, starterDeckClaimed }`).
- **Persistence**: `localStorage` only. Keys are namespaced under `nano.*` (see DATA.md).
- **Payments**: None. Shop is display-only; cart persists in localStorage; checkout is a confirmation screen. Card prices live in a `PRICE_MAP` in `js/pages/shop.js` — never on the card object.
- **Database**: None. No fetches to anything outside this site's origin.
- **Card data**: Card metadata at `nano-data/cards.json`; card art at `nano-data/media/*.png`. Both fetched at runtime via `fetch()`. Card `id`s are integers. The card object's `image` field is a path relative to `nano-data/` (e.g., `"media/nano-programmer.png"`); prepend the base in `js/lib/cards.js`. Full contract: see [DATA.md](./DATA.md).

## Style

Full style tokens, typography, spacing, breakpoints, and animation rules live in [STYLE.md](./STYLE.md). Quick reference:

- Palette: **Stone & Gold** — castle gray, parchment cream, royal gold, blood red, forest green.
- Type: serif display (`Cinzel`) for headings, humanist sans (`Inter`) for body, monospace (`IBM Plex Mono`) for stats.
- Layout: 8-px spacing grid. Mobile-first. Breakpoints at 600px, 900px, 1200px.
- Every color, font-family, font-size, spacing value, and z-index must reference a CSS custom property defined in `css/main.css`. No raw hex codes or px values in component CSS.

## Commands

```bash
# Serve locally from the AI/ directory
python3 -m http.server 8000

# Deploy (run from project working copy)
rsync -av --delete ./ /srv/csc391web/team2/AI/

# Quick lint pass (use what's installed; do not add new tooling)
# HTML
npx --no-install html-validate index.html learn.html deck.html play.html shop.html
# JS
npx --no-install eslint js/
```

If `npx --no-install` fails because the tool isn't installed, **do not install it**. Report the gap and move on.

## Do Not

- Do not add a build step, bundler, transpiler, or task runner.
- Do not import any framework or runtime library (React, Vue, jQuery, Alpine, htmx, Bootstrap, Tailwind, etc.).
- Do not write inline `style="…"` attributes. Use classes wired to tokens in `css/main.css`.
- Do not write inline `<script>` blocks for anything beyond a single boot call (`<script type="module" src="js/pages/home.js"></script>`).
- Do not invent card data, prices, art, or lore. If a value is missing, leave a `TODO:` comment and surface it.
- Do not modify, rename, restructure, or copy `nano-data/cards.json` or `nano-data/media/`. Surface mismatches in chat instead. (Known issues are tracked in DATA.md.)
- Do not hard-code card lists into JS. Read from `nano-data/cards.json` via `fetch()`.
- Do not synthesize stat fields (`strength`, `strategy`, `magic`, etc.). The real fields are `attack`, `defense`, `treatCost`, `type`, `role`, `rarity`, `cardCount`. Stick to those.
- Do not call any third-party network endpoint. Fonts via Google Fonts CSS link is the only exception.
- Do not store anything sensitive in localStorage (no card numbers, no addresses). Cart entries are card IDs and quantities only.
- Do not delete or rename files you didn't create in the same task.
- Do not silently swallow errors. Every `fetch()` and JSON parse needs a visible failure path (banner, console.error with context, no blank page).
- Do not use `eval`, `new Function`, or `innerHTML` with user-supplied or fetched-untrusted data. Build DOM via `document.createElement`.
- Do not ship placeholder Lorem Ipsum to a finished page. Either real copy or a visible `TODO` block.
- Do not block the main thread with long synchronous loops on the deck-builder grid. If iterating > 200 cards, batch with `requestAnimationFrame`.

## Definition of Done

A task is complete only when **all** of the following are true:

1. The affected page loads at `http://localhost:8000/<page>.html` with **zero** console errors and zero unhandled-promise warnings.
2. The feature it implements appears in the Pages & Functionality table above and demonstrably works in a manual click-through.
3. All colors, fonts, spacing, and z-indices used resolve to a token in STYLE.md. No raw hex / raw px in changed files.
4. `nano-data/cards.json` is read but never mutated. Validation in `js/lib/cards.js` accepts every entry (or surfaces a banner per DATA.md).
5. The page is keyboard navigable: Tab reaches every interactive element, Enter/Space activates it, focus is visible.
6. The page renders without horizontal scroll at 360px, 768px, and 1280px viewport widths.
7. No new file was created outside the directory tree in this document.
8. A short manual-test note is added to the PR/commit message: which pages were opened, what was clicked, what was checked.

## Verification Loop (run before declaring done)

1. `python3 -m http.server 8000`
2. Open the changed page in the browser.
3. Open DevTools Console — confirm no errors, no 404s in Network.
4. Click through every interactive element added or changed.
5. Resize the window to 360 / 768 / 1280 — confirm no horizontal scroll, no broken layout.
6. Tab through the page — confirm focus is visible at every stop.
7. Diff against this file: any new file path? any new dependency? any inline style? If yes, fix before claiming done.

## Open Questions (resolve before implementing the related feature)

- **Pricing.** `cards.json` has no price field. Until product confirms prices, `PRICE_MAP` in `js/pages/shop.js` is empty and shop entries render with a `"Price TBD"` badge. Do not invent prices.
- **Demo video file.** Placeholder until the team supplies `video/demo.mp4`.
- **Cookie-consent legal copy** for the "Accept Nano Treats" modal — needs final wording from the team. Use a `TODO:` comment in the modal markup.
- **Data/asset mismatches** (tracked in DATA.md, repeated here for visibility):
  - `nano-data/media/nano-snow.png` is missing — referenced by card 116 ("Snow Nano").
  - `nano-data/media/treat-slamon.png` exists, but card 203 ("Salmon Treat") points to `treat-salmon.png`. Filename typo to resolve with the team.
