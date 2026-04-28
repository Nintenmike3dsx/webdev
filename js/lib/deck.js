import * as cards from './cards.js';
import { getDecks, saveDecks, getActiveDeckId, setActiveDeckId } from './storage.js';

const DECK_MAX = 20;

export function createDeck(name = 'My Deck') {
  return {
    id: `deck-${Date.now()}`,
    name,
    cardIds: [],
  };
}

export function addCard(deck, cardId) {
  const card = cards.byId(cardId);
  if (!card) return { ok: false, reason: 'Unknown card' };

  const currentCount = deck.cardIds.filter(id => id === cardId).length;
  if (currentCount >= card.cardCount) {
    return { ok: false, reason: `Max ${card.cardCount} copies allowed` };
  }
  if (deck.cardIds.length >= DECK_MAX) {
    return { ok: false, reason: `Deck is full (${DECK_MAX} cards max)` };
  }

  deck.cardIds.push(cardId);
  return { ok: true };
}

export function removeOne(deck, cardId) {
  const idx = deck.cardIds.lastIndexOf(cardId);
  if (idx === -1) return false;
  deck.cardIds.splice(idx, 1);
  return true;
}

export function countOf(deck, cardId) {
  return deck.cardIds.filter(id => id === cardId).length;
}

// Returns a map of cardId -> count for display
export function deckCounts(deck) {
  const map = new Map();
  for (const id of deck.cardIds) {
    map.set(id, (map.get(id) ?? 0) + 1);
  }
  return map;
}

// Balance stats
export function deckStats(deck) {
  const cardList = cards.all();
  let totalAtk = 0, totalDef = 0;
  const typeCounts = { Character: 0, Action: 0, Treat: 0 };
  const rarityCounts = { Common: 0, Uncommon: 0, Rare: 0 };
  const treatCurve = {};

  for (const id of deck.cardIds) {
    const card = cardList.find(c => c.id === id);
    if (!card) continue;
    typeCounts[card.type] = (typeCounts[card.type] ?? 0) + 1;
    rarityCounts[card.rarity] = (rarityCounts[card.rarity] ?? 0) + 1;
    if (card.type === 'Character') {
      totalAtk += card.attack ?? 0;
      totalDef += card.defense ?? 0;
    }
    if (card.type !== 'Treat') {
      treatCurve[card.treatCost] = (treatCurve[card.treatCost] ?? 0) + 1;
    }
  }

  return { totalAtk, totalDef, typeCounts, rarityCounts, treatCurve };
}

// Persistence
export function loadActive() {
  const decks = getDecks();
  const activeId = getActiveDeckId();
  return decks.find(d => d.id === activeId) ?? decks[0] ?? null;
}

export function saveActive(deck) {
  const decks = getDecks();
  const idx = decks.findIndex(d => d.id === deck.id);
  if (idx >= 0) {
    decks[idx] = deck;
  } else {
    decks.push(deck);
  }
  saveDecks(decks);
  setActiveDeckId(deck.id);
}

export function getAllDecks() { return getDecks(); }
