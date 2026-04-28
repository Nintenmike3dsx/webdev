# Nano TCG Castle Site

A vanilla-web marketing and onboarding site for **Nano**, a physical trading card game with a medieval castle theme. Built for CSC 391 — Team 2.

## Team Contributions

| Team Member | Role | Contributions |
|---|---|---|
| *(TODO: Add names)* | *(TODO: Add roles)* | *(TODO: Fill in contributions)* |

## AI Use

This project was developed with the assistance of **Claude Code** (Anthropic), an AI coding assistant. AI was used to:

- Generate the full HTML/CSS/JS scaffold based on the CLAUDE.md specification
- Implement the card browser, deck builder, and balance racks
- Implement the scripted 3-turn battle demo state machine
- Implement the shop, cart, and checkout flow
- Implement the cookie consent and signup modals
- Write the localStorage wrapper (`js/lib/storage.js`)
- Write the card validation and singleton (`js/lib/cards.js`)

All AI output was reviewed by team members. No AI was used to generate game content, prices, or card lore — those come from `nano-data/cards.json` and the team's design decisions.

## Functionality Implemented

| # | Item | Status |
|---|---|---|
| 1 | Card search / Book of Cards | ✅ deck.html |
| 2 | Filter by type, rarity, cost | ✅ deck.html |
| 3 | Deck builder (20-card limit, cardCount cap) | ✅ deck.html |
| 4 | Deck balance visualizer (attack, defense, treat curve, type mix) | ✅ deck.html |
| 5 | Demo Game (3-turn scripted battle) | ✅ play.html |
| 6 | Shop (display-only, add to cart, checkout Coming Soon) | ✅ shop.html |
| 7 | Accept Nano Treats cookie consent popup | ✅ all pages |
| 8 | User accounts / sign-in (localStorage, name) | ✅ all pages |
| 9 | Free starter deck on signup | ✅ shop.html |

## Style Implemented

| # | Item | Status |
|---|---|---|
| 1 | Color palette (Stone & Gold) | ✅ css/main.css |
| 2 | Typography (Cinzel + Inter + IBM Plex Mono) | ✅ css/main.css |
| 3 | Castle metaphor (each page = a room) | ✅ all pages |
| 4 | Iconography (illuminated manuscript framing on cards/modals) | ✅ css/components/ |
| 5 | Animation & interactivity (card hover lift, battle animations) | ✅ css/components/animations.css |

## Known Data Issues

See DATA.md for the full list. Active issues:

1. **Missing image: `nano-snow.png`** — Card 116 (Snow Nano) references an art file that does not exist. The fallback triggers on load.
2. **Filename typo: `treat-slamon.png`** — Card 203 (Salmon Treat) references `treat-salmon.png` but the file is `treat-slamon.png`. Worked around in `js/lib/cards.js` via `imgUrl()`.

## Running Locally

```bash
# From the project root (webdev/ directory):
python3 -m http.server 8000
# Then open http://localhost:8000/index.html
```

## Deploying

```bash
rsync -av --delete ./ /srv/csc391web/team2/AI/
```

## File Structure

```
/
├── index.html          # Home — Main Hall
├── learn.html          # Library — Tapestry / Lore
├── deck.html           # Scriptorium — Cards + Deck Builder
├── play.html           # Battlefield — 3-turn Demo
├── shop.html           # Armory — Shop
├── css/
│   ├── main.css        # Tokens + global reset + layout
│   ├── components/     # nav, card, modal, animations
│   └── pages/          # per-page overrides
├── js/
│   ├── app.js          # Shared bootstrap (nav, modals)
│   ├── lib/            # storage, cards, deck, battle
│   └── pages/          # page-specific entry scripts
├── nano-data/          # cards.json + media/*.png (do not modify)
└── CLAUDE.md           # Project constraints (do not modify)
```
