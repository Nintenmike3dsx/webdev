// Bootstraps shared UI: nav state, cookie modal, signup modal.
import { getUser, setUser, getCookieConsent, setCookieConsent } from './lib/storage.js';

// ── Navigation state ─────────────────────────────────
function initNav() {
  const display = document.getElementById('nav-user-display');
  const signupBtn = document.getElementById('nav-signup-btn');
  const signoutBtn = document.getElementById('nav-signout-btn');

  function refresh() {
    const user = getUser();
    if (user) {
      if (display) display.textContent = `⚔ ${user.name}`;
      if (signupBtn) signupBtn.hidden = true;
      if (signoutBtn) signoutBtn.hidden = false;
    } else {
      if (display) display.textContent = '';
      if (signupBtn) signupBtn.hidden = false;
      if (signoutBtn) signoutBtn.hidden = true;
    }
  }

  if (signoutBtn) {
    signoutBtn.addEventListener('click', () => {
      import('./lib/storage.js').then(m => { m.clearUser(); refresh(); });
    });
  }

  if (signupBtn) {
    signupBtn.addEventListener('click', () => openSignupModal());
  }

  refresh();
  return refresh;
}

// ── Cookie consent modal ─────────────────────────────
function initCookieModal() {
  const consent = getCookieConsent();
  if (consent) return; // already decided

  const scrim = document.getElementById('cookie-modal-scrim');
  if (!scrim) return;

  setTimeout(() => scrim.classList.add('open'), 400);

  const acceptBtn = document.getElementById('cookie-accept-btn');
  const declineBtn = document.getElementById('cookie-decline-btn');

  function close(value) {
    setCookieConsent(value);
    scrim.classList.remove('open');
  }

  acceptBtn?.addEventListener('click', () => close('accepted'));
  declineBtn?.addEventListener('click', () => close('declined'));

  // Keyboard: close on Escape (decline)
  scrim.addEventListener('keydown', e => {
    if (e.key === 'Escape') close('declined');
  });

  // Trap focus inside modal
  const modal = scrim.querySelector('.modal');
  if (modal) trapFocus(scrim, modal);
}

// ── Signup modal ──────────────────────────────────────
function openSignupModal() {
  const scrim = document.getElementById('signup-modal-scrim');
  if (!scrim) return;
  scrim.classList.add('open');
  const input = document.getElementById('signup-name-input');
  if (input) input.focus();
}

function initSignupModal(onSignup) {
  const scrim = document.getElementById('signup-modal-scrim');
  if (!scrim) return;

  const form = document.getElementById('signup-form');
  const closeBtn = document.getElementById('signup-close-btn');

  function close() { scrim.classList.remove('open'); }

  closeBtn?.addEventListener('click', close);
  scrim.addEventListener('click', e => { if (e.target === scrim) close(); });
  scrim.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  form?.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('signup-name-input')?.value?.trim();
    if (!name) return;
    const user = { name, signedUpAt: new Date().toISOString(), starterDeckClaimed: false };
    setUser(user);
    close();
    if (onSignup) onSignup(user);
    const refreshNav = window.__nanoRefreshNav;
    if (refreshNav) refreshNav();
  });

  if (scrim) trapFocus(scrim, scrim.querySelector('.modal'));
}

// ── Focus trap ────────────────────────────────────────
function trapFocus(scrim, container) {
  if (!container) return;
  const focusable = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  scrim.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const nodes = [...container.querySelectorAll(focusable)].filter(el => !el.disabled && !el.hidden);
    if (!nodes.length) return;
    const first = nodes[0], last = nodes[nodes.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
}

// ── Mark active nav link ──────────────────────────────
function markActiveLink() {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.setAttribute('aria-current', 'page');
    }
  });
}

// ── Init ─────────────────────────────────────────────
export function init(options = {}) {
  const refreshNav = initNav();
  window.__nanoRefreshNav = refreshNav;
  initCookieModal();
  initSignupModal(options.onSignup);
  markActiveLink();
}
