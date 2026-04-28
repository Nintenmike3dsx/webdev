import { init as appInit } from '../app.js';
import * as cards from '../lib/cards.js';
import { imgUrl } from '../lib/cards.js';
import { addToCart, removeFromCart, getCart, clearCart, getUser, setUser } from '../lib/storage.js';

appInit({ onSignup: refreshStarterBanner });

// Prices in cents. Empty until product confirms pricing.
// id -> { price: number, salePrice?: number }
const PRICE_MAP = {};

function formatPrice(cents) {
  if (cents === undefined || cents === null) return null;
  return `$${(cents / 100).toFixed(2)}`;
}

// DOM refs
const shopGrid = document.getElementById('shop-grid');
const cartList = document.getElementById('cart-list');
const cartTotal = document.getElementById('cart-total-value');
const cartEmpty = document.getElementById('cart-empty');
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutScrim = document.getElementById('checkout-modal-scrim');
const starterBanner = document.getElementById('starter-deck-banner');
const claimBtn = document.getElementById('claim-starter-btn');

// ── Shop grid ─────────────────────────────────────────
function renderShopGrid(cardList) {
  if (!shopGrid) return;
  shopGrid.innerHTML = '';

  for (const card of cardList) {
    const item = buildShopItem(card);
    shopGrid.appendChild(item);
  }
}

function buildShopItem(card) {
  const article = document.createElement('article');
  article.className = 'shop-item';

  const imgWrap = document.createElement('div');
  imgWrap.className = 'shop-item-img-wrap';

  const img = document.createElement('img');
  img.className = 'shop-item-img';
  img.alt = card.name;
  img.loading = 'lazy';
  img.src = imgUrl(card);
  img.addEventListener('error', () => {
    console.warn(`[shop] Missing art for card ${card.id}: ${card.image}`);
    img.dataset.artMissing = 'true';
    img.style.display = 'none';
  });
  imgWrap.appendChild(img);

  const rarityEl = document.createElement('span');
  rarityEl.className = `card-rarity card-rarity-${card.rarity}`;
  rarityEl.textContent = card.rarity;
  imgWrap.appendChild(rarityEl);

  const body = document.createElement('div');
  body.className = 'shop-item-body';

  const name = document.createElement('div');
  name.className = 'shop-item-name';
  name.textContent = card.name;

  const typeEl = document.createElement('div');
  typeEl.className = 'shop-item-type';
  typeEl.textContent = `${card.type} · ${card.role}`;

  const priceInfo = PRICE_MAP[card.id];
  const priceEl = document.createElement('div');
  priceEl.className = 'shop-item-price';

  if (priceInfo) {
    if (priceInfo.salePrice) {
      priceEl.innerHTML = `<s>${formatPrice(priceInfo.price)}</s> ${formatPrice(priceInfo.salePrice)}`;
    } else {
      priceEl.textContent = formatPrice(priceInfo.price);
    }
  } else {
    const badge = document.createElement('span');
    badge.className = 'price-tbd';
    badge.textContent = 'Price TBD';
    priceEl.appendChild(badge);
  }

  body.appendChild(name);
  body.appendChild(typeEl);
  body.appendChild(priceEl);

  const footer = document.createElement('div');
  footer.className = 'shop-item-footer';

  const addBtn = document.createElement('button');
  addBtn.className = 'btn btn-sm';
  addBtn.textContent = '+ Add to Cart';
  addBtn.setAttribute('aria-label', `Add ${card.name} to cart`);
  addBtn.addEventListener('click', () => {
    addToCart(card.id, 1);
    renderCart();
    showToast(`${card.name} added to cart!`);
  });
  footer.appendChild(addBtn);

  article.appendChild(imgWrap);
  article.appendChild(body);
  article.appendChild(footer);
  return article;
}

// ── Cart ──────────────────────────────────────────────
function renderCart() {
  if (!cartList) return;
  const cart = getCart();
  cartList.innerHTML = '';

  if (cart.length === 0) {
    if (cartEmpty) cartEmpty.hidden = false;
    if (cartTotal) cartTotal.textContent = '$0.00';
    return;
  }

  if (cartEmpty) cartEmpty.hidden = true;
  let total = 0;

  for (const entry of cart) {
    const card = cards.byId(entry.cardId);
    if (!card) continue;
    const priceInfo = PRICE_MAP[card.id];
    const price = priceInfo?.salePrice ?? priceInfo?.price ?? null;
    if (price) total += price * entry.qty;

    const item = buildCartItem(card, entry.qty, price);
    cartList.appendChild(item);
  }

  if (cartTotal) cartTotal.textContent = total > 0 ? formatPrice(total) : 'TBD';
}

function buildCartItem(card, qty, priceCents) {
  const div = document.createElement('div');
  div.className = 'cart-item';

  const img = document.createElement('img');
  img.className = 'cart-item-img';
  img.alt = card.name;
  img.src = imgUrl(card);
  img.addEventListener('error', () => { img.style.display = 'none'; });

  const info = document.createElement('div');
  info.className = 'cart-item-info';

  const name = document.createElement('div');
  name.className = 'cart-item-name';
  name.textContent = `${card.name} ×${qty}`;

  const price = document.createElement('div');
  price.className = 'cart-item-price';
  price.textContent = priceCents ? formatPrice(priceCents * qty) : 'TBD';

  info.appendChild(name);
  info.appendChild(price);

  const rmBtn = document.createElement('button');
  rmBtn.className = 'cart-item-remove';
  rmBtn.setAttribute('aria-label', `Remove ${card.name} from cart`);
  rmBtn.textContent = '✕';
  rmBtn.addEventListener('click', () => { removeFromCart(card.id); renderCart(); });

  div.appendChild(img);
  div.appendChild(info);
  div.appendChild(rmBtn);
  return div;
}

// ── Checkout modal ────────────────────────────────────
function initCheckoutModal() {
  if (!checkoutScrim) return;

  checkoutBtn?.addEventListener('click', () => {
    checkoutScrim.classList.add('open');
    document.getElementById('checkout-close')?.focus();
  });

  const closeBtn = document.getElementById('checkout-close');
  const confirmBtn = document.getElementById('checkout-confirm-btn');

  closeBtn?.addEventListener('click', () => checkoutScrim.classList.remove('open'));
  checkoutScrim.addEventListener('click', e => { if (e.target === checkoutScrim) checkoutScrim.classList.remove('open'); });
  checkoutScrim.addEventListener('keydown', e => { if (e.key === 'Escape') checkoutScrim.classList.remove('open'); });

  confirmBtn?.addEventListener('click', () => {
    clearCart();
    renderCart();
    checkoutScrim.classList.remove('open');
    showToast('Your order has been placed! (Coming soon — no charge applied.)');
  });
}

// ── Starter deck ──────────────────────────────────────
function refreshStarterBanner() {
  if (!starterBanner) return;
  const user = getUser();
  if (user && !user.starterDeckClaimed) {
    starterBanner.hidden = false;
  } else {
    starterBanner.hidden = true;
  }
}

function initStarterDeck() {
  refreshStarterBanner();
  claimBtn?.addEventListener('click', () => {
    const user = getUser();
    if (!user) {
      document.getElementById('nav-signup-btn')?.click();
      return;
    }
    setUser({ ...user, starterDeckClaimed: true });
    refreshStarterBanner();
    showToast('Starter deck claimed! Find it in your deck builder.');
  });
}

// ── Toast ─────────────────────────────────────────────
function showToast(msg) {
  let toast = document.getElementById('shop-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'shop-toast';
    toast.style.cssText = `position:fixed;bottom:var(--space-6);left:50%;transform:translateX(-50%);background:var(--color-stone-dark);color:var(--color-gold);border:var(--border-gold);padding:var(--space-3) var(--space-6);border-radius:var(--radius-sm);z-index:var(--z-toast);font-family:var(--font-display);font-size:var(--fs-small);pointer-events:none;transition:opacity 300ms;`;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 2500);
}

// ── Boot ──────────────────────────────────────────────
async function boot() {
  try {
    await cards.init();
  } catch (err) {
    console.error('[shop] Failed to load cards:', err);
    if (shopGrid) shopGrid.innerHTML = '<p style="color:var(--color-blood);padding:var(--space-8)">Failed to load card data.</p>';
    return;
  }

  renderShopGrid(cards.all());
  renderCart();
  initCheckoutModal();
  initStarterDeck();
}

boot();
