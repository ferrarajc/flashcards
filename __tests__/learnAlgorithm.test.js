import AsyncStorage from '@react-native-async-storage/async-storage';
import { shuffle, buildOrder, saveSessionData } from '../utils/learnAlgorithm';

// ── shuffle ───────────────────────────────────────────────────────────────────

describe('shuffle', () => {
  it('returns an array of the same length', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(shuffle(arr)).toHaveLength(arr.length);
  });

  it('contains all the original elements', () => {
    const arr = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const result = shuffle(arr);
    expect(result).toEqual(expect.arrayContaining(arr));
    expect(arr).toEqual(expect.arrayContaining(result));
  });

  it('does not mutate the original array', () => {
    const arr = [1, 2, 3];
    const copy = [...arr];
    shuffle(arr);
    expect(arr).toEqual(copy);
  });

  it('produces different orderings across multiple calls (probabilistic)', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8];
    const results = new Set(Array.from({ length: 20 }, () => shuffle(arr).join(',')));
    // With 8 elements, probability of all 20 results identical is astronomically small
    expect(results.size).toBeGreaterThan(1);
  });

  it('handles an empty array', () => {
    expect(shuffle([])).toEqual([]);
  });

  it('handles a single-element array', () => {
    expect(shuffle([42])).toEqual([42]);
  });
});

// ── buildOrder ────────────────────────────────────────────────────────────────

describe('buildOrder', () => {
  function makeCards(n) {
    return Array.from({ length: n }, (_, i) => ({ index: i, front: `Q${i}`, back: `A${i}` }));
  }

  it('returns all cards', () => {
    const cards = makeCards(5);
    expect(buildOrder(cards, -1)).toHaveLength(5);
  });

  it('contains every card exactly once', () => {
    const cards = makeCards(4);
    const order = buildOrder(cards, -1);
    const indices = order.map(c => c.index).sort();
    expect(indices).toEqual([0, 1, 2, 3]);
  });

  it('never places the card matching lastId at position 0 (when >1 card)', () => {
    const cards = makeCards(5);
    // Run many times to rule out lucky shuffles
    for (let i = 0; i < 50; i++) {
      const order = buildOrder(cards, 2); // lastId = 2
      expect(order[0].index).not.toBe(2);
    }
  });

  it('ignores the lastId constraint for single-card arrays', () => {
    const cards = makeCards(1);
    const order = buildOrder(cards, 0);
    expect(order[0].index).toBe(0); // no swap possible
  });

  it('accepts lastId=-1 (no prior card) without error', () => {
    const cards = makeCards(3);
    expect(() => buildOrder(cards, -1)).not.toThrow();
    expect(buildOrder(cards, -1)).toHaveLength(3);
  });
});

// ── saveSessionData — trophy progression ─────────────────────────────────────

describe('saveSessionData — trophy progression', () => {
  const DECK_ID = 'deck-test';

  function setStoredDeck(trophies = {}, cardStats = {}) {
    const deck = { id: DECK_ID, name: 'Test', cards: [], trophies, cardStats };
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify([deck]));
    AsyncStorage.setItem.mockResolvedValue(undefined);
    return deck;
  }

  it('awards bronze on first completion (no trophies yet)', async () => {
    setStoredDeck({});
    const { newTrophy } = await saveSessionData(3, false, { id: DECK_ID }, {});
    expect(newTrophy).toBe('bronze');
  });

  it('awards silver on perfect run when bronze already held', async () => {
    setStoredDeck({ bronze: true });
    const { newTrophy } = await saveSessionData(3, true, { id: DECK_ID }, {});
    expect(newTrophy).toBe('silver');
  });

  it('does NOT award silver on imperfect run (missed at least one)', async () => {
    setStoredDeck({ bronze: true });
    const { newTrophy } = await saveSessionData(3, false, { id: DECK_ID }, {});
    expect(newTrophy).toBeNull();
  });

  it('awards gold on second perfect run (bronze + silver held)', async () => {
    setStoredDeck({ bronze: true, silver: true });
    const { newTrophy } = await saveSessionData(3, true, { id: DECK_ID }, {});
    expect(newTrophy).toBe('gold');
  });

  it('awards no trophy when all trophies already earned', async () => {
    setStoredDeck({ bronze: true, silver: true, gold: true });
    const { newTrophy } = await saveSessionData(3, true, { id: DECK_ID }, {});
    expect(newTrophy).toBeNull();
  });

  it('persists the newly earned trophy to AsyncStorage', async () => {
    setStoredDeck({});
    await saveSessionData(3, false, { id: DECK_ID }, {});
    const savedArg = AsyncStorage.setItem.mock.calls[0][1];
    const saved = JSON.parse(savedArg);
    expect(saved[0].trophies.bronze).toBe(true);
  });

  it('returns null newTrophy when deck not found in storage', async () => {
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify([{ id: 'other', name: 'x', cards: [] }]));
    const { newTrophy } = await saveSessionData(3, true, { id: DECK_ID }, {});
    expect(newTrophy).toBeNull();
  });

  it('returns null newTrophy when storage is empty', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    const { newTrophy } = await saveSessionData(3, true, { id: DECK_ID }, {});
    expect(newTrophy).toBeNull();
  });

  it('does not crash when AsyncStorage throws', async () => {
    AsyncStorage.getItem.mockRejectedValue(new Error('storage error'));
    const { newTrophy } = await saveSessionData(3, true, { id: DECK_ID }, {});
    expect(newTrophy).toBeNull();
  });
});

// ── saveSessionData — cardStats accumulation ──────────────────────────────────

describe('saveSessionData — cardStats accumulation', () => {
  const DECK_ID = 'deck-stats';

  it('merges session miss counts into existing card stats', async () => {
    const deck = { id: DECK_ID, name: 'Test', cards: [], trophies: {}, cardStats: { '0': 2 } };
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify([deck]));
    AsyncStorage.setItem.mockResolvedValue(undefined);

    const { cardStats } = await saveSessionData(3, false, { id: DECK_ID }, { '0': 3, '1': 1 });
    expect(cardStats['0']).toBe(5); // 2 existing + 3 new
    expect(cardStats['1']).toBe(1); // new entry
  });

  it('skips zero-count entries (cards with no misses this session)', async () => {
    const deck = { id: DECK_ID, name: 'Test', cards: [], trophies: {}, cardStats: {} };
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify([deck]));
    AsyncStorage.setItem.mockResolvedValue(undefined);

    const { cardStats } = await saveSessionData(3, false, { id: DECK_ID }, { '0': 0, '1': 2 });
    expect(cardStats['0']).toBeUndefined();
    expect(cardStats['1']).toBe(2);
  });
});
