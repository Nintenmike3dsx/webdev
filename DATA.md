# DATA.md — Nano TCG Data Contract

This file defines every piece of data the site reads or writes. If a feature needs data not described here, **stop and surface it** — do not invent a shape.

## Sources

| Kind | Location | Read by |
|---|---|---|
| Card metadata | `nano-data/cards.json` | `js/lib/cards.js` |
| Card art (PNGs) | `nano-data/media/*.png` | `<img src>` at runtime |
| User state | `localStorage` under the `nano.*` namespace | `js/lib/storage.js` |

All card data lives **inside the repo** under `nano-data/`. There is no external support volume, no external API, no database, no other data sources.

**Ignore**:
- `nano-data/cards.json~` — editor backup file. Do not read or write it.
- `nano-data/media/old/` — superseded art. Do not reference.

## Card Art

Every card object carries an `image` field whose value is a path **relative to the `nano-data/` directory** (e.g., `"media/nano-programmer.png"`). At runtime, build the URL by prepending the base:

```js
const CARD_DATA_BASE = 'nano-data/';
const url = CARD_DATA_BASE + card.image;
```

The base path is exposed once as a constant in `js/lib/cards.js`. Do not hard-code it elsewhere.

**Fallback**: if an `<img>` 404s, swap `src` to `img/placeholders/card-back.png` and add a `data-art-missing="true"` attribute on the element so it's discoverable in DevTools. Log a single `console.warn` per missing card per page load — no flooding.

## `nano-data/cards.json` Shape

A single JSON file holding an array of card objects. Loaded once per page that needs it via:

```js
const res = await fetch('nano-data/cards.json', { cache: 'no-cache' });
if (!res.ok) throw new Error(`cards.json ${res.status}`);
const cards = await res.json();
```

### Required fields (all cards)

| Field | Type | Notes |
|---|---|---|
| `id` | integer | Stable, unique. Current ranges: 100s = Characters, 200s = Treats, 300s = Actions. |
| `name` | string | Display name (e.g., `"Programmer Nano"`). |
| `type` | string | One of: `"Character"`, `"Action"`, `"Treat"`. Capitalized exactly. |
| `role` | string | Free-form sub-class label (e.g., `"Code Hound"`, `"Resting Terrier"`, `"Trap"`, `"Resource"`). |
| `rarity` | string | One of: `"Common"`, `"Uncommon"`, `"Rare"`. Capitalized exactly. |
| `cardCount` | integer | Copies included per pack/starter set (e.g., 1 for Rare, 2 for Uncommon, 3–4 for Common). |
| `treatCost` | integer | Resource cost to play. `0`–`10`. Treats themselves are `0`. |
| `attack` | integer or `null` | Combat attack stat. `null` for Action and Treat cards. |
| `defense` | integer or `null` | Combat defense stat. `null` for Action and Treat cards. |
| `rulesText` | string | Mechanical card text. Authoritative gameplay copy — render verbatim. |
| `flavorText` | string or `null` | Italicized lore quote. Often `null` on Action/Treat cards. |
| `details` | string or `null` | Designer commentary. Used in the Book of Cards detail view, not on the card face. May be `null`. |
| `image` | string | Path relative to `nano-data/` (e.g., `"media/nano-programmer.png"`). |

There are **no** `cost`, `stats`, `lore`, `tags`, or `price` fields on the actual cards. Do not invent them. The deck-builder reads `treatCost`, `attack`, `defense` directly.

### Type-specific expectations

- `type: "Character"` — has non-null `attack` and `defense`. Image filename starts with `nano-`.
- `type: "Action"` — `attack` and `defense` are `null`. Image filename starts with `action-`.
- `type: "Treat"` — `attack` and `defense` are `null`. `treatCost` is `0`. `role` is `"Resource"`. Image filename starts with `treat-`.

### Example (Character)

```json
{
  "id": 101,
  "name": "Programmer Nano",
  "type": "Character",
  "role": "Code Hound",
  "rarity": "Uncommon",
  "cardCount": 2,
  "treatCost": 5,
  "attack": 3,
  "defense": 2,
  "rulesText": "When Programmer Nano enters play, look at the top 3 cards of your deck. Put one into your hand and the rest on the bottom in any order.",
  "flavorText": "\"He debugs by glaring at the screen until the bug becomes ashamed.\"",
  "details": "Programmer Nano gives you card advantage on entry, letting you dig for the piece you need most.",
  "image": "media/nano-programmer.png"
}
```

### Validation rules (enforced in `js/lib/cards.js`)

On load, `cards.js` validates each entry. Any failure is `console.error`-ed with the card index and reason, the bad entry is dropped from the in-memory list, and a banner (`#data-error-banner`) becomes visible. **Do not silently fix bad data — surface it.**

1. `id` is an integer and unique across the array.
2. `type` is one of `"Character" | "Action" | "Treat"`.
3. `rarity` is one of `"Common" | "Uncommon" | "Rare"`.
4. `cardCount` is an integer ≥ 1.
5. `treatCost` is an integer in `[0, 10]`.
6. If `type === "Character"`: `attack` and `defense` are integers in `[0, 10]`.
7. If `type !== "Character"`: `attack` and `defense` are both `null`.
8. `image` is a non-empty string starting with `media/` and ending in `.png`.
9. `rulesText` is a non-empty string.

If a future card adds a new `type` or `rarity`, update this file in the same commit that adds it. Validation must reject unknown values until the contract is widened here.

## Pricing (display-only shop)

`cards.json` has **no price field**. The shop overlays prices via a separate map in `js/pages/shop.js`:

```js
// id -> price in cents; salePrice is optional
const PRICE_MAP = {
  // 101: { price: 499, salePrice: 299 },
  // ...
};
```

Until product confirms pricing, this map ships empty and the shop renders cards with a `"Price TBD"` badge. **Do not invent prices.** Adding entries to `PRICE_MAP` is the only sanctioned place to put pricing data.

## Deck-builder stat aggregations

The deck-builder shows live "balance racks" computed from a deck's card list. Aggregations are derived only from real fields:

| Rack | Computation |
|---|---|
| Treat curve | Histogram of `treatCost` across the deck (excluding Treat-type cards). |
| Attack rack (swords) | Sum of `attack` across all Character cards in the deck. |
| Defense rack (shields) | Sum of `defense` across all Character cards in the deck. |
| Type mix (scrolls) | Counts of `Character` / `Action` / `Treat` in the deck. |
| Rarity mix | Counts of `Common` / `Uncommon` / `Rare` in the deck. |

There are no `strength`, `strategy`, or `magic` stats. Do not synthesize them.

## localStorage Schema

All keys live under the `nano.` prefix. Wrap every read/write through `js/lib/storage.js`. Never call `localStorage` directly from a page script.

| Key | Type | Shape |
|---|---|---|
| `nano.user` | JSON object | `{ "name": string, "signedUpAt": ISO-8601 string, "starterDeckClaimed": boolean }` |
| `nano.cookieConsent` | string | One of `"accepted"`, `"declined"`, or absent (not yet asked) |
| `nano.decks` | JSON array | Array of `{ "id": string, "name": string, "cardIds": integer[] }` — `cardIds` are card `id` integers from `cards.json`, with repeats allowed up to each card's `cardCount`. |
| `nano.activeDeckId` | string | id matching one entry in `nano.decks` |
| `nano.cart` | JSON array | Array of `{ "cardId": integer, "qty": integer }` |
| `nano.lastBattle` | JSON object | `{ "result": "win"\|"loss"\|"draw", "at": ISO-8601 }` |
| `nano.schemaVersion` | integer | Bumped when any value above changes shape; triggers migration in `storage.js`. |

### Rules

- **Versioning**: bump `nano.schemaVersion` if the shape of any value above changes. On load, if the stored version is older, run a migration (or wipe and warn).
- **Size**: total `nano.*` payload must stay under 256 KB. Hard cap; check on write.
- **Privacy**: never store payment info, full names, addresses, or anything beyond what's tabled above. The user's `name` is whatever string they typed at signup — treat it as a display alias, not PII.
- **Resets**: a hidden dev affordance — pressing `Shift+Ctrl+R` (only when `?dev=1` is in the URL) wipes all `nano.*` keys.

## Data flow expectations

- `js/lib/cards.js` exposes a singleton: `cards.all()` returns the validated array, `cards.byId(id)` returns one (id is an integer), `cards.search(query, filters)` returns a filtered array. All other modules go through this — no module re-fetches `cards.json`.
- `js/lib/storage.js` exposes typed getters/setters per key (`getUser()`, `setUser(u)`, `getCart()`, `addToCart(id, qty)`, etc.). Page scripts call these — they do not stringify/parse JSON themselves.
- `js/lib/deck.js` and `js/lib/battle.js` consume the card list and storage layer. They never touch the DOM directly outside their own root element passed in by the page script.

## Known data issues (track and resolve before shipping affected pages)

These are real mismatches between the current `cards.json` and the contents of `nano-data/media/`. Surface them in chat — do not paper over them.

1. **Missing image: `nano-snow.png`**. Card id 116 ("Snow Nano") references `media/nano-snow.png`, but the file does not exist in `nano-data/media/`. Either add the asset or remove/rename the card. The fallback rule above will trigger until this is resolved.
2. **Filename typo: `treat-slamon.png`**. Card id 203 ("Salmon Treat") references `media/treat-salmon.png`, but the actual file is `media/treat-slamon.png` (transposed letters). Decide whether to rename the file (preferred, keep the JSON correct) or update `cards.json`. Do not silently rewrite `cards.json` without team confirmation.
3. **`media/old/`** contains earlier versions of art (e.g., `nano-cool.png`). These are not referenced from `cards.json` and must not be linked from any page.

Once each issue is resolved, delete its entry from this list in the same commit.
