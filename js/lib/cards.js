export const CARD_DATA_BASE = 'nano-data/';

const VALID_TYPES = new Set(['Character', 'Action', 'Treat']);
const VALID_RARITIES = new Set(['Common', 'Uncommon', 'Rare']);

// Singleton state
let _cards = null;
let _loading = null;

function _validate(card, idx) {
  const errors = [];
  if (!Number.isInteger(card.id)) errors.push('id not integer');
  if (!VALID_TYPES.has(card.type)) errors.push(`unknown type: ${card.type}`);
  if (!VALID_RARITIES.has(card.rarity)) errors.push(`unknown rarity: ${card.rarity}`);
  if (!Number.isInteger(card.cardCount) || card.cardCount < 1) errors.push('invalid cardCount');
  if (!Number.isInteger(card.treatCost) || card.treatCost < 0 || card.treatCost > 10) errors.push('invalid treatCost');
  if (card.type === 'Character') {
    if (!Number.isInteger(card.attack) || card.attack < 0 || card.attack > 10) errors.push('invalid attack');
    if (!Number.isInteger(card.defense) || card.defense < 0 || card.defense > 10) errors.push('invalid defense');
  } else {
    if (card.attack !== null) errors.push('attack should be null for non-Character');
    if (card.defense !== null) errors.push('defense should be null for non-Character');
  }
  if (typeof card.image !== 'string' || !card.image.startsWith('media/') || !card.image.endsWith('.png')) {
    errors.push('invalid image path');
  }
  if (typeof card.rulesText !== 'string' || card.rulesText.trim() === '') errors.push('empty rulesText');
  return errors;
}

async function _load() {
  const res = await fetch('nano-data/cards.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error(`cards.json HTTP ${res.status}`);
  const raw = await res.json();
  if (!Array.isArray(raw)) throw new Error('cards.json is not an array');

  const seen = new Set();
  const valid = [];
  let hadErrors = false;

  for (let i = 0; i < raw.length; i++) {
    const card = raw[i];
    const errs = _validate(card, i);
    if (errs.length) {
      console.error(`[cards] Card at index ${i} (id=${card.id}) dropped:`, errs.join('; '));
      hadErrors = true;
      continue;
    }
    if (seen.has(card.id)) {
      console.error(`[cards] Duplicate id ${card.id} at index ${i}, dropped`);
      hadErrors = true;
      continue;
    }
    seen.add(card.id);
    valid.push(card);
  }

  if (hadErrors) {
    const banner = document.getElementById('data-error-banner');
    if (banner) {
      banner.textContent = 'Some card data failed validation — check the console for details.';
      banner.classList.add('visible');
    }
  }

  return valid;
}

export async function init() {
  if (_cards) return _cards;
  if (_loading) return _loading;
  _loading = _load().then(data => { _cards = data; _loading = null; return data; });
  return _loading;
}

export function all() {
  if (!_cards) throw new Error('[cards] Call init() before all()');
  return _cards;
}

export function byId(id) {
  if (!_cards) throw new Error('[cards] Call init() before byId()');
  return _cards.find(c => c.id === id) ?? null;
}

export function search(query = '', filters = {}) {
  if (!_cards) throw new Error('[cards] Call init() before search()');
  let results = _cards;

  if (query.trim()) {
    const q = query.toLowerCase().trim();
    results = results.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q) ||
      c.rulesText.toLowerCase().includes(q)
    );
  }

  if (filters.type) results = results.filter(c => c.type === filters.type);
  if (filters.rarity) results = results.filter(c => c.rarity === filters.rarity);
  if (filters.role) results = results.filter(c => c.role === filters.role);
  if (filters.treatCost !== undefined && filters.treatCost !== '') {
    results = results.filter(c => c.treatCost === Number(filters.treatCost));
  }

  return results;
}

// Build a full image URL for a card, applying the known filename typo workaround.
export function imgUrl(card) {
  // Known data issue: card 203 references treat-salmon.png but file is treat-slamon.png
  let path = card.image;
  if (card.id === 203) path = 'media/treat-slamon.png';
  return CARD_DATA_BASE + path;
}
