import { init as appInit } from '../app.js';
import * as cards from '../lib/cards.js';
import { imgUrl } from '../lib/cards.js';
import * as deckLib from '../lib/deck.js';

appInit();

// State
let currentDeck = deckLib.loadActive() ?? deckLib.createDeck('My Deck');
let currentQuery = '';
let currentFilters = {};
let cardDetailModal = null;
let allCardEls = [];

// DOM references
const grid = document.getElementById('card-grid');
const searchInput = document.getElementById('card-search');
const filterType = document.getElementById('filter-type');
const filterRarity = document.getElementById('filter-rarity');
const filterCost = document.getElementById('filter-cost');
const deckNameInput = document.getElementById('deck-name-input');
const deckList = document.getElementById('deck-list');
const deckCountBadge = document.getElementById('deck-count');
const saveDeckBtn = document.getElementById('save-deck-btn');
const newDeckBtn = document.getElementById('new-deck-btn');
const cardCountDisplay = document.getElementById('card-count-display');
const cardDetailScrim = document.getElementById('card-detail-scrim');

// ── Rendering ────────────────────────────────────────
function renderCard(card) {
  const el = document.createElement('article');
  el.className = 'card animate-card-enter';
  el.tabIndex = 0;
  el.dataset.cardId = card.id;
  el.setAttribute('aria-label', `${card.name}, ${card.type}, Cost: ${card.treatCost}`);

  const imgWrap = document.createElement('div');
  imgWrap.className = 'card-img-wrap';
  imgWrap.dataset.cardName = card.name;

  const img = document.createElement('img');
  img.className = 'card-img';
  img.alt = card.name;
  img.loading = 'lazy';
  img.src = imgUrl(card);
  img.addEventListener('error', () => {
    console.warn(`[deck] Missing art for card ${card.id}: ${card.image}`);
    img.dataset.artMissing = 'true';
    imgWrap.dataset.missingArt = 'true';
  });
  imgWrap.appendChild(img);

  const rarityEl = document.createElement('span');
  rarityEl.className = `card-rarity card-rarity-${card.rarity}`;
  rarityEl.textContent = card.rarity;
  imgWrap.appendChild(rarityEl);

  const body = document.createElement('div');
  body.className = 'card-body';

  const name = document.createElement('p');
  name.className = 'card-name';
  name.textContent = card.name;

  const badge = document.createElement('span');
  badge.className = `card-type-badge card-type-${card.type}`;
  badge.textContent = card.type;

  const statsRow = document.createElement('div');
  statsRow.className = 'card-stats';

  if (card.type === 'Character') {
    const atk = document.createElement('span');
    atk.className = 'card-stat-atk';
    atk.textContent = `⚔ ${card.attack}`;
    const def = document.createElement('span');
    def.className = 'card-stat-def';
    def.textContent = `🛡 ${card.defense}`;
    statsRow.appendChild(atk);
    statsRow.appendChild(def);
  }
  const cost = document.createElement('span');
  cost.className = 'card-stat-cost';
  cost.textContent = `🦴 ${card.treatCost}`;
  statsRow.appendChild(cost);

  body.appendChild(name);
  body.appendChild(badge);
  body.appendChild(statsRow);

  el.appendChild(imgWrap);
  el.appendChild(body);

  el.addEventListener('click', e => {
    // Click on image opens detail; click anywhere else adds to deck
    if (e.target === img || e.target === imgWrap) {
      openCardDetail(card);
    } else {
      addCardToDeck(card);
    }
  });
  el.addEventListener('keydown', e => {
    if (e.key === 'Enter') addCardToDeck(card);
    if (e.key === ' ') { e.preventDefault(); openCardDetail(card); }
  });

  return el;
}

function renderGrid(cardList) {
  if (!grid) return;
  grid.innerHTML = '';
  allCardEls = [];

  if (!cardList.length) {
    const empty = document.createElement('p');
    empty.style.color = 'var(--color-bone)';
    empty.style.padding = 'var(--space-8)';
    empty.textContent = 'No cards match your search.';
    grid.appendChild(empty);
    return;
  }

  // Batch with rAF for large lists
  let i = 0;
  function renderBatch() {
    const end = Math.min(i + 30, cardList.length);
    for (; i < end; i++) {
      const el = renderCard(cardList[i]);
      allCardEls.push({ el, id: cardList[i].id });
      grid.appendChild(el);
    }
    if (i < cardList.length) {
      requestAnimationFrame(renderBatch);
    } else {
      refreshCardStates();
      if (cardCountDisplay) cardCountDisplay.textContent = `${cardList.length} cards`;
    }
  }
  requestAnimationFrame(renderBatch);
}

function refreshCardStates() {
  const counts = deckLib.deckCounts(currentDeck);
  for (const { el, id } of allCardEls) {
    const card = cards.byId(id);
    if (!card) continue;
    const count = counts.get(id) ?? 0;
    el.classList.toggle('in-deck', count > 0);
    el.classList.toggle('at-limit', count >= card.cardCount || currentDeck.cardIds.length >= 20);
  }
}

// ── Deck sidebar ─────────────────────────────────────
function renderDeckList() {
  if (!deckList) return;
  deckList.innerHTML = '';
  const counts = deckLib.deckCounts(currentDeck);

  if (counts.size === 0) {
    const empty = document.createElement('li');
    empty.className = 'deck-list-empty';
    empty.textContent = 'No cards yet. Click a card to add it.';
    deckList.appendChild(empty);
  } else {
    for (const [id, count] of counts) {
      const card = cards.byId(id);
      if (!card) continue;
      const li = buildDeckListItem(card, count);
      deckList.appendChild(li);
    }
  }

  if (deckCountBadge) {
    deckCountBadge.innerHTML = `${currentDeck.cardIds.length}<span> / 20</span>`;
  }

  renderBalanceRacks();
}

function buildDeckListItem(card, count) {
  const li = document.createElement('li');
  li.className = 'deck-list-item';

  const name = document.createElement('span');
  name.className = 'deck-list-item-name';
  name.textContent = card.name;

  const qty = document.createElement('span');
  qty.className = 'deck-list-item-qty';
  qty.textContent = `×${count}`;

  const rmBtn = document.createElement('button');
  rmBtn.className = 'deck-list-item-remove';
  rmBtn.setAttribute('aria-label', `Remove ${card.name} from deck`);
  rmBtn.textContent = '✕';
  rmBtn.addEventListener('click', () => {
    deckLib.removeOne(currentDeck, card.id);
    renderDeckList();
    refreshCardStates();
  });

  li.appendChild(name);
  li.appendChild(qty);
  li.appendChild(rmBtn);
  return li;
}

// ── Balance racks ─────────────────────────────────────
function renderBalanceRacks() {
  const stats = deckLib.deckStats(currentDeck);
  const MAX_ATK = 40, MAX_DEF = 40;

  // Attack bar
  const atkFill = document.getElementById('rack-atk-fill');
  const atkVal = document.getElementById('rack-atk-val');
  if (atkFill) atkFill.style.width = `${Math.min(100, (stats.totalAtk / MAX_ATK) * 100)}%`;
  if (atkVal) atkVal.textContent = stats.totalAtk;

  // Defense bar
  const defFill = document.getElementById('rack-def-fill');
  const defVal = document.getElementById('rack-def-val');
  if (defFill) defFill.style.width = `${Math.min(100, (stats.totalDef / MAX_DEF) * 100)}%`;
  if (defVal) defVal.textContent = stats.totalDef;

  // Type mix
  const charPill = document.getElementById('mix-character');
  const actPill = document.getElementById('mix-action');
  const trtPill = document.getElementById('mix-treat');
  if (charPill) charPill.textContent = `⚔ ${stats.typeCounts.Character ?? 0}`;
  if (actPill)  actPill.textContent  = `✦ ${stats.typeCounts.Action ?? 0}`;
  if (trtPill)  trtPill.textContent  = `🦴 ${stats.typeCounts.Treat ?? 0}`;

  // Treat curve histogram
  renderTreatCurve(stats.treatCurve);
}

function renderTreatCurve(curve) {
  const wrap = document.getElementById('treat-curve');
  if (!wrap) return;
  wrap.innerHTML = '';
  const maxCost = 10;
  const maxCount = Math.max(1, ...Object.values(curve));
  for (let c = 0; c <= maxCost; c++) {
    const count = curve[c] ?? 0;
    const bar = document.createElement('div');
    bar.className = 'treat-curve-bar';
    bar.style.height = `${(count / maxCount) * 44}px`;
    bar.dataset.cost = c;
    bar.setAttribute('title', `Cost ${c}: ${count} card${count !== 1 ? 's' : ''}`);
    wrap.appendChild(bar);
  }
}

// ── Add / remove cards ────────────────────────────────
function addCardToDeck(card) {
  const result = deckLib.addCard(currentDeck, card.id);
  if (!result.ok) {
    showToast(result.reason);
    return;
  }
  renderDeckList();
  refreshCardStates();
}

// ── Card detail modal ─────────────────────────────────
function openCardDetail(card) {
  if (!cardDetailScrim) return;
  const body = document.getElementById('card-detail-body');
  if (!body) return;

  body.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'modal-card-detail';

  // Image
  const imgEl = document.createElement('img');
  imgEl.src = imgUrl(card);
  imgEl.alt = card.name;
  imgEl.addEventListener('error', () => { imgEl.style.display = 'none'; });
  wrap.appendChild(imgEl);

  // Info
  const info = document.createElement('div');

  const typeBadge = document.createElement('span');
  typeBadge.className = `card-type-badge card-type-${card.type}`;
  typeBadge.textContent = `${card.type} · ${card.role}`;
  info.appendChild(typeBadge);

  if (card.type === 'Character') {
    const statRow = document.createElement('div');
    statRow.className = 'modal-stat-row';
    statRow.innerHTML = `<span class="card-stat-atk">⚔ ${card.attack}</span><span class="card-stat-def">🛡 ${card.defense}</span><span class="card-stat-cost">🦴 ${card.treatCost}</span>`;
    info.appendChild(statRow);
  } else {
    const costRow = document.createElement('div');
    costRow.className = 'modal-stat-row';
    costRow.innerHTML = `<span class="card-stat-cost">🦴 ${card.treatCost}</span>`;
    info.appendChild(costRow);
  }

  const rules = document.createElement('p');
  rules.className = 'modal-card-rules';
  rules.textContent = card.rulesText;
  info.appendChild(rules);

  if (card.flavorText) {
    const flavor = document.createElement('p');
    flavor.className = 'modal-card-flavor';
    flavor.textContent = card.flavorText;
    info.appendChild(flavor);
  }

  if (card.details) {
    const details = document.createElement('p');
    details.style.fontSize = 'var(--fs-small)';
    details.style.color = 'var(--color-ink-muted)';
    details.textContent = card.details;
    info.appendChild(details);
  }

  const addBtn = document.createElement('button');
  addBtn.className = 'btn';
  addBtn.textContent = 'Add to Deck';
  addBtn.addEventListener('click', () => { addCardToDeck(card); });
  info.appendChild(addBtn);

  wrap.appendChild(info);
  body.appendChild(wrap);

  document.getElementById('card-detail-title').textContent = card.name;
  cardDetailScrim.classList.add('open');
  document.getElementById('card-detail-close').focus();
}

function initCardDetailModal() {
  if (!cardDetailScrim) return;
  const closeBtn = document.getElementById('card-detail-close');
  closeBtn?.addEventListener('click', () => cardDetailScrim.classList.remove('open'));
  cardDetailScrim.addEventListener('click', e => { if (e.target === cardDetailScrim) cardDetailScrim.classList.remove('open'); });
  cardDetailScrim.addEventListener('keydown', e => { if (e.key === 'Escape') cardDetailScrim.classList.remove('open'); });
}

// ── Filter / search ───────────────────────────────────
function applyFilters() {
  currentFilters = {
    type: filterType?.value || '',
    rarity: filterRarity?.value || '',
    treatCost: filterCost?.value ?? '',
  };
  const results = cards.search(currentQuery, currentFilters);
  renderGrid(results);
}

// ── Toast ─────────────────────────────────────────────
function showToast(msg) {
  let toast = document.getElementById('deck-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'deck-toast';
    toast.style.cssText = `position:fixed;bottom:var(--space-6);left:50%;transform:translateX(-50%);background:var(--color-stone-dark);color:var(--color-gold);border:var(--border-gold);padding:var(--space-3) var(--space-6);border-radius:var(--radius-sm);z-index:var(--z-toast);font-family:var(--font-display);font-size:var(--fs-small);pointer-events:none;`;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 2000);
}

// ── Events ────────────────────────────────────────────
searchInput?.addEventListener('input', e => { currentQuery = e.target.value; applyFilters(); });
filterType?.addEventListener('change', applyFilters);
filterRarity?.addEventListener('change', applyFilters);
filterCost?.addEventListener('change', applyFilters);

saveDeckBtn?.addEventListener('click', () => {
  const name = deckNameInput?.value?.trim() || 'My Deck';
  currentDeck.name = name;
  deckLib.saveActive(currentDeck);
  showToast('Deck saved!');
});

newDeckBtn?.addEventListener('click', () => {
  currentDeck = deckLib.createDeck('New Deck');
  if (deckNameInput) deckNameInput.value = currentDeck.name;
  renderDeckList();
  refreshCardStates();
  showToast('New deck started.');
});

// ── Boot ──────────────────────────────────────────────
async function boot() {
  try {
    await cards.init();
  } catch (err) {
    console.error('[deck] Failed to load cards:', err);
    if (grid) grid.innerHTML = '<p style="color:var(--color-blood);padding:var(--space-8)">Failed to load card data. Please refresh.</p>';
    return;
  }

  if (deckNameInput) deckNameInput.value = currentDeck.name;
  initCardDetailModal();
  renderGrid(cards.all());
  renderDeckList();
}

boot();
