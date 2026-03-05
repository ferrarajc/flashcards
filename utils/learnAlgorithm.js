import AsyncStorage from '@react-native-async-storage/async-storage';

// Fisher-Yates shuffle
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build a new random order that never starts with the card whose index === lastId
export function buildOrder(cards, lastId) {
  const shuffled = shuffle(cards);
  if (shuffled.length > 1 && shuffled[0].index === lastId) {
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }
  return shuffled;
}

// Persist session results and compute trophy award.
// Returns { newTrophy: 'bronze'|'silver'|'gold'|null, cardStats: {} }
export async function saveSessionData(totalGotten, perfectSession, deck, sessionMissCounts) {
  try {
    const stored = await AsyncStorage.getItem('decks');
    if (!stored) return { newTrophy: null, cardStats: {} };
    const decks = JSON.parse(stored);
    const idx = decks.findIndex(d => d.id === deck.id);
    if (idx === -1) return { newTrophy: null, cardStats: {} };

    // Merge session miss counts into cumulative per-card stats
    const existingStats = decks[idx].cardStats || {};
    const updatedStats = { ...existingStats };
    for (const [key, count] of Object.entries(sessionMissCounts)) {
      if (count > 0) updatedStats[key] = (updatedStats[key] || 0) + count;
    }

    // Trophy logic — track which (if any) was newly earned this session
    const existing = decks[idx].trophies || {};
    const updated = { ...existing };
    let newTrophy = null;
    if (!updated.bronze) {
      updated.bronze = true;
      newTrophy = 'bronze';
    } else if (perfectSession && !updated.silver) {
      updated.silver = true;
      newTrophy = 'silver';
    } else if (perfectSession && updated.silver && !updated.gold) {
      updated.gold = true;
      newTrophy = 'gold';
    }

    decks[idx] = { ...decks[idx], trophies: updated, cardStats: updatedStats };
    await AsyncStorage.setItem('decks', JSON.stringify(decks));
    return { newTrophy, cardStats: updatedStats };
  } catch (_) {
    return { newTrophy: null, cardStats: {} };
  }
}
