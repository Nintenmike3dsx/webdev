import { init as appInit } from '../app.js';
import * as cards from '../lib/cards.js';
import { imgUrl } from '../lib/cards.js';

appInit();

// Featured card IDs (interesting characters with art we know exists)
const FEATURED_IDS = [106, 110, 101]; // Death Star, Sith, Programmer

async function loadFeatured() {
  try {
    await cards.init();
  } catch (err) {
    console.error('[home] Failed to load cards:', err);
    return;
  }

  const container = document.getElementById('featured-cards');
  if (!container) return;
  container.innerHTML = '';

  for (const id of FEATURED_IDS) {
    const card = cards.byId(id);
    if (!card) continue;
    container.appendChild(buildFeaturedCard(card));
  }
}

function buildFeaturedCard(card) {
  const el = document.createElement('article');
  el.className = 'card animate-card-enter';
  el.setAttribute('tabindex', '0');
  el.setAttribute('aria-label', `${card.name} — ${card.type}`);

  const imgWrap = document.createElement('div');
  imgWrap.className = 'card-img-wrap';
  imgWrap.dataset.cardName = card.name;

  const img = document.createElement('img');
  img.className = 'card-img';
  img.alt = card.name;
  img.loading = 'lazy';
  img.src = imgUrl(card);
  img.addEventListener('error', () => {
    console.warn(`[home] Missing art: ${card.image}`);
    img.dataset.artMissing = 'true';
    imgWrap.dataset.missingArt = 'true';
  });

  imgWrap.appendChild(img);

  const rarity = document.createElement('span');
  rarity.className = `card-rarity card-rarity-${card.rarity}`;
  rarity.textContent = card.rarity;
  imgWrap.appendChild(rarity);

  const body = document.createElement('div');
  body.className = 'card-body';

  const name = document.createElement('p');
  name.className = 'card-name';
  name.textContent = card.name;

  const typeBadge = document.createElement('span');
  typeBadge.className = `card-type-badge card-type-${card.type}`;
  typeBadge.textContent = card.type;

  const stats = document.createElement('div');
  stats.className = 'card-stats';

  if (card.type === 'Character') {
    const atk = document.createElement('span');
    atk.className = 'card-stat-atk';
    atk.textContent = `⚔ ${card.attack}`;

    const def = document.createElement('span');
    def.className = 'card-stat-def';
    def.textContent = `🛡 ${card.defense}`;

    stats.appendChild(atk);
    stats.appendChild(def);
  }

  const cost = document.createElement('span');
  cost.className = 'card-stat-cost';
  cost.textContent = `🦴 ${card.treatCost}`;
  stats.appendChild(cost);

  body.appendChild(name);
  body.appendChild(typeBadge);
  body.appendChild(stats);

  el.appendChild(imgWrap);
  el.appendChild(body);

  // Link to deck page
  el.addEventListener('click', () => { location.href = 'deck.html'; });
  el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') location.href = 'deck.html'; });

  return el;
}

loadFeatured();

// ── Transparent nav on hero, opaque after scroll ──────
const nav = document.querySelector('.site-nav');

function updateNav() {
  if (!nav) return;
  // Hero is ~100vh; switch to solid once user scrolls past ~60px
  nav.classList.toggle('nav-transparent', window.scrollY < 60);
}

window.addEventListener('scroll', updateNav, { passive: true });
updateNav(); // set initial state immediately
