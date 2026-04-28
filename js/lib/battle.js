// Scripted 3-turn demo battle. No AI inference — outcome is predetermined.
// The player chooses which card to play each turn; the opponent follows a fixed script.

const PLAYER_START_HEALTH = 20;
const OPPONENT_START_HEALTH = 20;

// Scripted opponent turns (card IDs from cards.json)
const OPPONENT_SCRIPT = [
  { id: 114, message: "The opponent plays Taco Nano! He wasn't offered any — he didn't let that stop him." },
  { id: 304, message: "The opponent plays Cone of Shame! Your strongest character loses 2 Attack!" },
  { id: 110, message: "The opponent plays Sith Nano! He tries to steal your weakest character!" },
];

export function createBattle(playerHandIds) {
  return {
    state: 'player_turn', // player_turn | opponent_turn | battle | end
    turn: 1,
    playerHealth: PLAYER_START_HEALTH,
    opponentHealth: OPPONENT_START_HEALTH,
    playerHand: [...playerHandIds],
    playerField: [],
    opponentField: [],
    log: [],
    selectedCard: null,
    result: null,
  };
}

export function selectCard(battle, cardId) {
  if (battle.state !== 'player_turn') return battle;
  if (!battle.playerHand.includes(cardId)) return battle;
  return { ...battle, selectedCard: cardId };
}

export function playCard(battle, cardId) {
  if (battle.state !== 'player_turn') return { battle, message: null };
  if (!battle.playerHand.includes(cardId)) return { battle, message: null };

  const newHand = battle.playerHand.filter((id, i, arr) => {
    // Remove first occurrence
    const firstIdx = arr.indexOf(cardId);
    return i !== firstIdx;
  });

  const newField = [...battle.playerField, cardId];
  const newLog = [...battle.log];

  return {
    battle: {
      ...battle,
      playerHand: newHand,
      playerField: newField,
      selectedCard: null,
      state: 'opponent_turn',
      log: newLog,
    },
    message: null,
  };
}

export function opponentTurn(battle) {
  if (battle.state !== 'opponent_turn') return { battle, entry: null };

  const scriptIdx = battle.turn - 1;
  const script = OPPONENT_SCRIPT[scriptIdx] ?? null;
  const newOpponentField = script ? [...battle.opponentField, script.id] : [...battle.opponentField];
  const entry = script
    ? { type: 'opponent', text: script.message }
    : { type: 'system', text: 'The opponent passes.' };

  return {
    battle: {
      ...battle,
      opponentField: newOpponentField,
      state: 'battle',
      log: [...battle.log, entry],
    },
    entry,
  };
}

export function resolveBattle(battle, cardData) {
  if (battle.state !== 'battle') return { battle, entries: [] };

  const entries = [];
  let playerDmg = 0;
  let opponentDmg = 0;

  // Each player character attacks the opponent
  for (const id of battle.playerField) {
    const card = cardData.find(c => c.id === id);
    if (!card || card.type !== 'Character') continue;
    const atk = card.attack ?? 0;
    opponentDmg += atk;
    entries.push({ type: 'player', text: `${card.name} attacks for ${atk} damage!` });
  }

  // Each opponent character attacks the player
  for (const id of battle.opponentField) {
    const card = cardData.find(c => c.id === id);
    if (!card || card.type !== 'Character') continue;
    const atk = card.attack ?? 0;
    playerDmg += atk;
    entries.push({ type: 'opponent', text: `${card.name} retaliates for ${atk} damage!` });
  }

  const newPlayerHealth = Math.max(0, battle.playerHealth - playerDmg);
  const newOpponentHealth = Math.max(0, battle.opponentHealth - opponentDmg);

  entries.push({ type: 'system', text: `Battle round ${battle.turn} ends. Player: ${newPlayerHealth} HP | Opponent: ${newOpponentHealth} HP` });

  let newState, result;
  const isLastTurn = battle.turn >= 3;

  if (newOpponentHealth <= 0 || isLastTurn) {
    newState = 'end';
    // In the scripted demo, player always wins on turn 3
    result = newOpponentHealth <= 0 || isLastTurn ? 'win' : 'loss';
    entries.push({ type: 'result', text: result === 'win' ? 'Victory! The kingdom is yours!' : 'Defeat! The opponent prevails...' });
  } else {
    newState = 'player_turn';
  }

  return {
    battle: {
      ...battle,
      playerHealth: newPlayerHealth,
      opponentHealth: newOpponentHealth,
      state: newState,
      turn: battle.turn + 1,
      result,
      log: [...battle.log, ...entries],
    },
    entries,
  };
}
