import { init as appInit } from '../app.js';
import * as cards from '../lib/cards.js';
import { imgUrl } from '../lib/cards.js';
import * as battle from '../lib/battle.js';
import { setLastBattle } from '../lib/storage.js';

appInit();

// Player hand: Programmer Nano, Couch Nap Nano, Windbreaker Nano, Squeaky Toy, Taco Nano
const PLAYER_HAND_IDS = [101, 102, 107, 305, 114];

let state = null;
let cardData = null;

// DOM refs
const playerHandEl      = document.getElementById('player-hand');
const playerFieldEl     = document.getElementById('player-field');
const opponentFieldEl   = document.getElementById('opponent-field');
const battleLogEl       = document.getElementById('battle-log');
const playerHpFill      = document.getElementById('player-hp-fill');
const opponentHpFill    = document.getElementById('opponent-hp-fill');
const playerHpVal       = document.getElementById('player-hp-val');
const opponentHpVal     = document.getElementById('opponent-hp-val');
const turnIndicatorEl   = document.getElementById('turn-indicator');
const endTurnBtn        = document.getElementById('end-turn-btn');
const restartBtn        = document.getElementById('restart-btn');
const resultOverlay     = document.getElementById('game-result-overlay');
const resultTitle       = document.getElementById('result-title');
const resultMsg         = document.getElementById('result-msg');

// Card zoom overlay refs
const zoomScrim     = document.getElementById('card-zoom-scrim');
const zoomImg       = document.getElementById('zoom-img');
const zoomName      = document.getElementById('zoom-card-name');
const zoomTypeBadge = document.getElementById('zoom-type-badge');
const zoomRole      = document.getElementById('zoom-role');
const zoomRules     = document.getElementById('zoom-rules');
const zoomFlavor    = document.getElementById('zoom-flavor');
const zoomDetails   = document.getElementById('zoom-details');
const zoomAtk       = document.getElementById('zoom-atk');
const zoomDef       = document.getElementById('zoom-def');
const zoomCost      = document.getElementById('zoom-cost');
const zoomPlayBtn   = document.getElementById('zoom-play-btn');
const zoomBackBtn   = document.getElementById('zoom-back-btn');
const zoomCloseBtn  = document.getElementById('zoom-close-btn');

// ── Card zoom overlay ─────────────────────────────────
let _zoomedCardId = null;

function openCardZoom(card) {
  _zoomedCardId = card.id;

  // Populate image
  zoomImg.src = imgUrl(card);
  zoomImg.alt = card.name;
  zoomImg.onerror = () => { zoomImg.style.display = 'none'; };

  // Name / type / role
  zoomName.textContent = card.name;
  zoomTypeBadge.className = `card-type-badge card-type-${card.type}`;
  zoomTypeBadge.textContent = `${card.type} · ${card.rarity}`;
  zoomRole.textContent = card.role;

  // Stats
  if (card.type === 'Character') {
    zoomAtk.textContent  = `⚔ ${card.attack}`;
    zoomDef.textContent  = `🛡 ${card.defense}`;
    zoomAtk.hidden = false;
    zoomDef.hidden = false;
  } else {
    zoomAtk.textContent = '';
    zoomDef.textContent = '';
    zoomAtk.hidden = true;
    zoomDef.hidden = true;
  }
  zoomCost.textContent = `🦴 ${card.treatCost}`;

  // Rules / flavor / details
  zoomRules.textContent = card.rulesText;
  if (card.flavorText) {
    zoomFlavor.textContent = card.flavorText;
    zoomFlavor.hidden = false;
  } else {
    zoomFlavor.hidden = true;
  }
  if (card.details) {
    zoomDetails.textContent = card.details;
    zoomDetails.hidden = false;
  } else {
    zoomDetails.hidden = true;
  }

  // Play button: only active on player's turn
  const canPlay = state.state === 'player_turn';
  zoomPlayBtn.disabled = !canPlay;
  zoomPlayBtn.title = canPlay ? '' : 'Not your turn';

  // Open overlay, focus the play button
  zoomScrim.classList.add('open');
  (canPlay ? zoomPlayBtn : zoomBackBtn).focus();
}

function closeCardZoom() {
  zoomScrim.classList.remove('open');
  _zoomedCardId = null;
}

function initZoomOverlay() {
  zoomCloseBtn?.addEventListener('click', closeCardZoom);
  zoomBackBtn?.addEventListener('click', closeCardZoom);

  zoomPlayBtn?.addEventListener('click', () => {
    if (_zoomedCardId === null) return;
    const idToPlay = _zoomedCardId;
    closeCardZoom();
    playCardById(idToPlay);
  });

  // Close on scrim click or Escape
  zoomScrim?.addEventListener('click', e => { if (e.target === zoomScrim) closeCardZoom(); });
  zoomScrim?.addEventListener('keydown', e => { if (e.key === 'Escape') closeCardZoom(); });

  // Focus trap inside zoom panel
  zoomScrim?.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const panel = zoomScrim.querySelector('.card-zoom-panel');
    if (!panel) return;
    const focusable = [...panel.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])')].filter(el => !el.disabled && !el.hidden);
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
    else            { if (document.activeElement === last)  { e.preventDefault(); first.focus(); } }
  });
}

// ── Hand rendering ────────────────────────────────────
function renderHand() {
  if (!playerHandEl) return;
  playerHandEl.innerHTML = '';
  for (const id of state.playerHand) {
    const card = cardData.find(c => c.id === id);
    if (!card) continue;
    playerHandEl.appendChild(buildHandCard(card));
  }
}

function buildHandCard(card) {
  const el = document.createElement('div');
  el.className = 'hand-card';
  el.tabIndex = 0;
  el.dataset.cardId = card.id;
  el.setAttribute('aria-label', `${card.name}, Cost: ${card.treatCost}. Click to inspect.`);
  el.setAttribute('role', 'button');

  const img = document.createElement('img');
  img.className = 'hand-card-img';
  img.alt = card.name;
  img.src = imgUrl(card);
  img.addEventListener('error', () => { img.src = ''; img.style.background = 'var(--color-stone)'; });

  const name = document.createElement('div');
  name.className = 'hand-card-name';
  name.textContent = card.name;

  const costEl = document.createElement('div');
  costEl.className = 'hand-card-cost';
  costEl.textContent = card.treatCost;

  const hint = document.createElement('div');
  hint.className = 'hand-card-hint';
  hint.textContent = 'tap to inspect';

  el.appendChild(img);
  el.appendChild(name);
  el.appendChild(costEl);
  el.appendChild(hint);

  el.addEventListener('click', () => {
    if (state.state !== 'player_turn') return;
    openCardZoom(card);
  });
  el.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (state.state !== 'player_turn') return;
      openCardZoom(card);
    }
  });

  return el;
}

// ── Field rendering ───────────────────────────────────
function renderField(fieldEl, cardIds, faceDown = false) {
  if (!fieldEl) return;
  fieldEl.innerHTML = '';
  if (faceDown) {
    for (let i = 0; i < cardIds.length; i++) {
      const back = document.createElement('div');
      back.className = 'field-card-back';
      back.textContent = '?';
      back.setAttribute('aria-label', 'Opponent card (face down)');
      fieldEl.appendChild(back);
    }
    return;
  }
  for (const id of cardIds) {
    const card = cardData.find(c => c.id === id);
    if (!card) continue;
    fieldEl.appendChild(buildFieldCard(card));
  }
}

function buildFieldCard(card) {
  const el = document.createElement('div');
  el.className = 'field-card animate-card-play';
  el.setAttribute('aria-label', card.name);

  const img = document.createElement('img');
  img.className = 'field-card-img';
  img.alt = card.name;
  img.src = imgUrl(card);
  img.addEventListener('error', () => { img.style.display = 'none'; });

  const name = document.createElement('div');
  name.className = 'field-card-name';
  name.textContent = card.name;

  el.appendChild(img);
  el.appendChild(name);

  if (card.type === 'Character') {
    const stats = document.createElement('div');
    stats.className = 'field-card-stats';
    stats.innerHTML = `<span class="field-card-atk">⚔${card.attack}</span><span class="field-card-def">🛡${card.defense}</span>`;
    el.appendChild(stats);
  }

  return el;
}

// ── Log / UI ──────────────────────────────────────────
function appendLog(entry) {
  if (!battleLogEl) return;
  const li = document.createElement('li');
  li.className = `battle-log-entry log-${entry.type}`;
  li.textContent = entry.text;
  battleLogEl.appendChild(li);
  battleLogEl.scrollTop = battleLogEl.scrollHeight;
}

function updateUI() {
  const maxHp = 20;
  const pct = v => `${Math.max(0, Math.min(100, (v / maxHp) * 100))}%`;
  if (playerHpFill)   { playerHpFill.style.width   = pct(state.playerHealth);   playerHpFill.setAttribute('aria-valuenow', state.playerHealth); }
  if (opponentHpFill) { opponentHpFill.style.width = pct(state.opponentHealth); opponentHpFill.setAttribute('aria-valuenow', state.opponentHealth); }
  if (playerHpVal)   playerHpVal.textContent   = state.playerHealth;
  if (opponentHpVal) opponentHpVal.textContent = state.opponentHealth;

  if (turnIndicatorEl) {
    const labels = {
      player_turn:   `Turn ${state.turn} — Your Move`,
      opponent_turn: "Opponent's Turn",
      battle:        'Battle Phase!',
      end:           'Game Over',
    };
    turnIndicatorEl.textContent = labels[state.state] ?? '';
  }

  const isPlayerTurn = state.state === 'player_turn';
  if (endTurnBtn) endTurnBtn.disabled = !isPlayerTurn;

  if (resultOverlay && state.state === 'end') {
    resultOverlay.classList.add('visible');
    if (resultTitle) {
      resultTitle.textContent = state.result === 'win' ? 'Victory!' : 'Defeat!';
      resultTitle.className = `result-title result-${state.result}`;
    }
    if (resultMsg) {
      resultMsg.textContent = state.result === 'win'
        ? 'The realm is safe. Your Nanos proved their worth!'
        : 'The opponent prevails. Train harder, warrior.';
    }
  }
}

function fullRender() {
  renderHand();
  renderField(playerFieldEl, state.playerField);
  renderField(opponentFieldEl, state.opponentField, true);
  updateUI();
}

// ── Battle actions ────────────────────────────────────
function playCardById(cardId) {
  if (state.state !== 'player_turn') return;
  const card = cardData.find(c => c.id === cardId);
  if (!card) return;

  const { battle: newState } = battle.playCard(state, cardId);
  state = newState;
  appendLog({ type: 'player', text: `You play ${card.name}!` });
  fullRender();

  setTimeout(doOpponentTurn, 800);
}

function doOpponentTurn() {
  const { battle: newState, entry } = battle.opponentTurn(state);
  state = newState;
  appendLog(entry);
  renderField(opponentFieldEl, state.opponentField, false);
  updateUI();

  setTimeout(doResolveBattle, 1000);
}

function doResolveBattle() {
  const { battle: newState, entries } = battle.resolveBattle(state, cardData);
  state = newState;
  entries.forEach(e => appendLog(e));

  const bf = document.getElementById('battlefield');
  bf?.classList.add('animate-flash');
  setTimeout(() => bf?.classList.remove('animate-flash'), 400);

  fullRender();

  if (state.state === 'end') setLastBattle(state.result);
}

function onEndTurn() {
  appendLog({ type: 'system', text: 'You pass your turn without playing a card.' });
  state = { ...state, state: 'opponent_turn' };
  updateUI();
  setTimeout(doOpponentTurn, 600);
}

function onRestart() {
  closeCardZoom();
  if (resultOverlay) resultOverlay.classList.remove('visible');
  state = battle.createBattle(PLAYER_HAND_IDS);
  if (battleLogEl) battleLogEl.innerHTML = '';
  appendLog({ type: 'system', text: 'A new battle begins! Choose wisely.' });
  fullRender();
}

// ── Boot ──────────────────────────────────────────────
endTurnBtn?.addEventListener('click', onEndTurn);
restartBtn?.addEventListener('click', onRestart);
document.getElementById('result-play-again')?.addEventListener('click', onRestart);

async function boot() {
  try {
    cardData = await cards.init();
  } catch (err) {
    console.error('[play] Failed to load cards:', err);
    return;
  }

  initZoomOverlay();
  state = battle.createBattle(PLAYER_HAND_IDS);
  appendLog({ type: 'system', text: 'A challenger approaches! The battle for the kingdom begins.' });
  appendLog({ type: 'system', text: 'Click any card in your hand to inspect it, then play it.' });
  fullRender();
}

boot();
