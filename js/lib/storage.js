const SCHEMA_VERSION = 1;
const MAX_BYTES = 256 * 1024;

function _read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? null : JSON.parse(raw);
  } catch {
    console.error('[storage] Failed to parse', key);
    return null;
  }
}

function _write(key, value) {
  const serialized = JSON.stringify(value);
  if (serialized.length > MAX_BYTES) {
    console.error('[storage] Payload too large for', key, serialized.length, 'bytes');
    return false;
  }
  try {
    localStorage.setItem(key, serialized);
    return true;
  } catch (e) {
    console.error('[storage] Write failed for', key, e);
    return false;
  }
}

function _checkVersion() {
  const stored = _read('nano.schemaVersion');
  if (stored === null) {
    _write('nano.schemaVersion', SCHEMA_VERSION);
    return;
  }
  if (stored < SCHEMA_VERSION) {
    console.warn('[storage] Schema migration needed:', stored, '->', SCHEMA_VERSION);
    // Wipe and reinitialize on version mismatch
    const keys = Object.keys(localStorage).filter(k => k.startsWith('nano.'));
    keys.forEach(k => localStorage.removeItem(k));
    _write('nano.schemaVersion', SCHEMA_VERSION);
  }
}

_checkVersion();

// ── User ──────────────────────────────────────────────
export function getUser() { return _read('nano.user'); }

export function setUser(u) {
  if (!u || typeof u.name !== 'string') {
    console.error('[storage] Invalid user object');
    return false;
  }
  return _write('nano.user', {
    name: u.name,
    signedUpAt: u.signedUpAt ?? new Date().toISOString(),
    starterDeckClaimed: u.starterDeckClaimed ?? false,
  });
}

export function clearUser() {
  localStorage.removeItem('nano.user');
}

// ── Cookie consent ────────────────────────────────────
export function getCookieConsent() { return _read('nano.cookieConsent'); }

export function setCookieConsent(value) {
  if (value !== 'accepted' && value !== 'declined') {
    console.error('[storage] Invalid consent value:', value);
    return false;
  }
  return _write('nano.cookieConsent', value);
}

// ── Decks ─────────────────────────────────────────────
export function getDecks() { return _read('nano.decks') ?? []; }

export function saveDecks(decks) { return _write('nano.decks', decks); }

export function getActiveDeckId() { return _read('nano.activeDeckId'); }

export function setActiveDeckId(id) { return _write('nano.activeDeckId', id); }

// ── Cart ──────────────────────────────────────────────
export function getCart() { return _read('nano.cart') ?? []; }

export function addToCart(cardId, qty = 1) {
  const cart = getCart();
  const existing = cart.find(e => e.cardId === cardId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ cardId, qty });
  }
  return _write('nano.cart', cart);
}

export function removeFromCart(cardId) {
  const cart = getCart().filter(e => e.cardId !== cardId);
  return _write('nano.cart', cart);
}

export function clearCart() {
  return _write('nano.cart', []);
}

// ── Last battle ───────────────────────────────────────
export function getLastBattle() { return _read('nano.lastBattle'); }

export function setLastBattle(result) {
  return _write('nano.lastBattle', { result, at: new Date().toISOString() });
}

// ── Dev reset (Shift+Ctrl+R with ?dev=1) ──────────────
if (new URLSearchParams(location.search).get('dev') === '1') {
  document.addEventListener('keydown', e => {
    if (e.shiftKey && e.ctrlKey && e.key === 'R') {
      e.preventDefault();
      Object.keys(localStorage).filter(k => k.startsWith('nano.')).forEach(k => localStorage.removeItem(k));
      console.info('[storage] Dev reset: all nano.* keys cleared');
      location.reload();
    }
  });
}
