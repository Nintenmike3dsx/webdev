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

Functionality Table
The table below captures the functionality the site needs to ship. Items are scored Must (required for launch), Should (high value, ship soon after), or Nice (theme-deepening polish).
#
Functionality Item
Why it matters for this site
How it uses the dataset (if applicable)
Priority (Must / Should / Nice)
1
Card search / Book of Cards
Competitive players need to find specific cards by name or attribute fast — this is the spine of the site.
Reads name, type, and stat columns from nano_cards.csv to power keyword and filter search.
Must
2
Filter cards by type (e.g., strength, strategy, magic)
Power users build around archetypes; multi-attribute filters let them assemble themed decks.
Reads the type column from nano_cards.csv (and supports multi-select).
Must
3
Deck builder
Core competitive tool — lets users assemble, save, and iterate on decks from the full roster.
Pulls the full nano_cards.csv roster; saves the user's deck list to local storage and (when signed in) the database.
Must
4
Deck balance visualizer (sword rack / mead glass)
Visual feedback on a deck's strength / strategy / magic balance reinforces the medieval theme and helps power users tune builds.
Aggregates stat columns from nano_cards.csv across the user's selected deck.
Should
5
Demo Game (Play Nano)
Try-before-buy interactive battle vs. an AI opponent on a king's-eye battlefield UI; converts visitors to signups.
Reads card stats and ability text from nano_cards.csv to drive turn resolution.
Must
6
Pack-opening animation
Dopamine moment that mirrors the physical TCG experience and drives repeat engagement.
Randomly draws cards from nano_cards.csv weighted by a rarity column.
Must
7
Shop (Armory page)
Primary revenue driver — sells single cards, packs, and pre-built decks via the armory metaphor.
Reads price and availability columns from nano_cards.csv to populate listings.
Must
8
Free starter deck on signup
Acquisition incentive that turns curious visitors into accounts and recurring players.
Triggers a curated draw of starter cards from nano_cards.csv on first login.
Should
9
Card detail / hover animation
Lets competitive players inspect art, full stat block, and lore without leaving the Book of Cards.
Renders all columns of the selected nano_cards.csv row in the detail overlay.
Should
10
Learn Nano — AI-generated lore page
Sustains world-building and gives newcomers a hook beyond raw mechanics.
Optionally seeds the AI prompt with notable card names pulled from nano_cards.csv.
Should
11
User accounts / sign-in
Persists decks, collection, and signup rewards across sessions; required for shop checkout.
Does not read nano_cards.csv directly; stores user_id references that join against it.
Must
12
Card collection / inventory
Tracks which cards each user owns so the deck builder can flag legal vs. unowned cards.
Cross-references user inventory rows with nano_cards.csv to render owned/unowned states.
Should
13
"Accept Nano Treats" cookie consent pop-up
Legal compliance for cookies / local storage, delivered in on-theme medieval flavor copy.
N/A — operates on browser storage, not the dataset.
Must
14
Secure payment processing
Required to monetize the shop while keeping card and payment data safe.
N/A — handled by a third-party processor (e.g., Stripe); only order metadata touches the cards table.
Must

 
Style Table
The table below captures the visual and experiential decisions that make the castle metaphor work and keep the site usable for power users.
#
Style Item
Specification
Rationale
1
Color palette
Primary #2A1810 (castle stone-brown), Accent #C9A961 (gold leaf), Highlight #8B0000 (banner red), Parchment #F4E8D0 (page background), Ink #1B1209 (body text).
Stone-brown and parchment evoke a castle interior; gold and banner-red read as royalty and battle without overwhelming. Parchment gives long stat tables enough contrast to stay readable for power users.
2
Typography
Headings: Cinzel (or IM Fell English) serif. Body: Lora (or EB Garamond) serif at 16 px / 1.6 line-height. Card stats: tabular-figure variant for column alignment.
Period-appropriate display type sells the medieval fantasy; legible serif body type and tabular figures keep dense card data scannable for competitive players.
3
Iconography and imagery
AI-generated banners, tapestries, shields, scrolls; image-as-button navigation; consistent illuminated-manuscript framing on cards and modals.
Reinforces the "you are inside a castle" metaphor and lets the site lead with visuals over text — the user needs to feel the world before reading about it.
4
Page metaphor and layout
Each page is a room of the castle. Home = main hall (overview banners, sale pillars). Learn Nano = interactive tapestry. Book of Cards / Build a Deck = library + scriptorium. Shop = armory (cards mounted on shields). Play Nano = battlefield (king's-eye-view UI). Transitions zoom into the next room.
Turns navigation into exploration so dwell time goes up and the brand feels like a place rather than a menu. Each room also primes the user emotionally for the task on that page (study in the library, fight on the battlefield).
5
Animation and interactivity
Card hover lift + glow on the Book of Cards. Multi-stage pack-opening reveal (seal-break → fan-out → flip). Demo Game battle animations (troop march, spell flash). Deck balance visualized with filling mead glasses and stocked sword racks.
Provides the tactile feedback competitive players expect — a digital TCG that feels lifeless loses to physical play. The mead-glass / sword-rack visuals also tie analytics back to the medieval theme.
6
Soundscape (optional, default off)
Ambient layer per room: crackling fire on Home, page-turning on Learn Nano, marketplace murmur on Shop, clashing steel on Play Nano. Global mute toggle in the nav bar.
Deepens immersion without forcing it on competitive players who often grind deck builds in silence or with their own audio.

