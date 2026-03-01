import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  Animated, useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const MAX_FONT = 24;
const MIN_FONT = 10;
const MAX_WIDTH = 480;

const TROPHY_COLORS = { bronze: '#cd7f32', silver: '#a8a9ad', gold: '#ffd700' };

// Fisher-Yates shuffle
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build a new random order that never starts with lastId
function buildOrder(cards, lastId) {
  const shuffled = shuffle(cards);
  if (shuffled.length > 1 && shuffled[0].index === lastId) {
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }
  return shuffled;
}

// Animated counter that bounces on increment
function AnimatedCounter({ value, style }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevValue = useRef(value);

  useEffect(() => {
    if (value !== prevValue.current) {
      prevValue.current = value;
      Animated.sequence([
        Animated.spring(scaleAnim, { toValue: 1.5, useNativeDriver: true, speed: 50, bounciness: 4 }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 5 }),
      ]).start();
    }
  }, [value]);

  return (
    <Animated.Text style={[style, { transform: [{ scale: scaleAnim }] }]}>
      {value}
    </Animated.Text>
  );
}

export default function LearnScreen({ route, navigation }) {
  const { deck } = route.params;
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 40, MAX_WIDTH);

  // Tag each card with its original index for repeat-prevention
  const allCards = deck.cards.map((c, i) => ({ ...c, index: i }));

  // Circulation: cards still in play
  const [circulation, setCirculation] = useState(() => buildOrder(allCards, -1));
  const [queuePos, setQueuePos] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  // wrongSet: indices of cards answered wrong at least once (still in circulation)
  const [wrongSet, setWrongSet] = useState(() => new Set());
  const [gotItCount, setGotItCount] = useState(0); // cards permanently cleared
  const [hasMissed, setHasMissed] = useState(false);
  const lastIdRef = useRef(-1);
  // Per-card miss counts for this session (cardIndex string → clickCount)
  const sessionMissCountsRef = useRef({});

  // Trophies already earned on this deck — loaded fresh from storage on mount
  const [deckTrophies, setDeckTrophies] = useState({});
  useEffect(() => {
    AsyncStorage.getItem('decks').then(stored => {
      if (!stored) return;
      const decks = JSON.parse(stored);
      const d = decks.find(d => d.id === deck.id);
      if (d?.trophies) setDeckTrophies(d.trophies);
    });
  }, []);

  const total = allCards.length;
  // Derived display values — always reflect current card states, never exceed total
  const didGet = gotItCount;
  const didntGet = wrongSet.size;
  const learnedPct = Math.round((gotItCount / total) * 100);
  const currentCard = circulation[queuePos] ?? null;

  // Font sizing
  const [frontSize, setFrontSize] = useState(MAX_FONT);
  const [backSize, setBackSize] = useState(MAX_FONT);
  const frontSizeRef = useRef(MAX_FONT);
  const backSizeRef = useRef(MAX_FONT);

  const resetFontSizes = () => {
    frontSizeRef.current = MAX_FONT;
    backSizeRef.current = MAX_FONT;
    setFrontSize(MAX_FONT);
    setBackSize(MAX_FONT);
  };

  const handleFrontLayout = (e) => {
    const h = e.nativeEvent.lines.reduce((sum, l) => sum + l.height, 0);
    if (h > 160 && frontSizeRef.current > MIN_FONT) {
      frontSizeRef.current -= 1;
      setFrontSize(frontSizeRef.current);
    }
  };

  const handleBackLayout = (e) => {
    const h = e.nativeEvent.lines.reduce((sum, l) => sum + l.height, 0);
    if (h > 120 && backSizeRef.current > MIN_FONT) {
      backSizeRef.current -= 1;
      setBackSize(backSizeRef.current);
    }
  };

  // Card flip: scaleX 1→0 (shrink), swap content at 0, then 0→1 (grow back)
  const flipAnim = useRef(new Animated.Value(1)).current;
  const isFlippingRef = useRef(false);

  const flipToAnswer = () => {
    if (isFlippingRef.current || showAnswer) return;
    isFlippingRef.current = true;
    Animated.timing(flipAnim, {
      toValue: 0,
      duration: 160,
      useNativeDriver: true,
    }).start(() => {
      setShowAnswer(true);
      Animated.timing(flipAnim, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }).start(() => {
        isFlippingRef.current = false;
      });
    });
  };

  const resetCard = () => {
    flipAnim.setValue(1);
    isFlippingRef.current = false;
    setShowAnswer(false);
  };

  const advance = (newCirculation, removedIndex) => {
    resetFontSizes();
    resetCard();

    const remaining = newCirculation;
    if (remaining.length === 0) return;

    const nextPos = queuePos + 1;
    if (nextPos >= remaining.length) {
      const lastId = removedIndex ?? (currentCard?.index ?? -1);
      lastIdRef.current = lastId;
      setCirculation(buildOrder(remaining, lastId));
      setQueuePos(0);
    } else {
      setQueuePos(nextPos);
    }
  };

  const handleGotIt = async () => {
    const wasWrong = wrongSet.has(currentCard.index);
    const newCirculation = circulation.filter((_, i) => i !== queuePos);
    const newGotItCount = gotItCount + 1;

    // If this card was previously wrong, remove it from wrongSet (red decrement)
    const newWrongSet = new Set(wrongSet);
    if (wasWrong) newWrongSet.delete(currentCard.index);

    setGotItCount(newGotItCount);
    setWrongSet(newWrongSet);

    if (newCirculation.length === 0) {
      const { newTrophy, cardStats } = await saveSessionData(
        newGotItCount, !hasMissed, deck, sessionMissCountsRef.current
      );
      navigation.replace('LearnComplete', { deck, newTrophy, cardStats });
      return;
    }

    advance(newCirculation, currentCard.index);
    setCirculation(newCirculation);
  };

  const handleDidntGetIt = () => {
    const wasWrong = wrongSet.has(currentCard.index);
    // Always count every press for study guide (even repeat misses on same card)
    const key = String(currentCard.index);
    sessionMissCountsRef.current[key] = (sessionMissCountsRef.current[key] || 0) + 1;

    if (!wasWrong) {
      // First time wrong: increment red, mark card
      const newWrongSet = new Set(wrongSet);
      newWrongSet.add(currentCard.index);
      setWrongSet(newWrongSet);
      setHasMissed(true);
    }
    // Already wrong before: no counter changes, card stays in circulation
    advance(circulation, null);
  };

  const handleSkip = () => {
    advance(circulation, null);
  };

  if (!currentCard) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.headerOuter}>
        <View style={[styles.headerInner, { width: contentWidth }]}>
          {/* Deck name in a bordered box */}
          <View style={styles.deckBox}>
            <Text style={styles.deckName} numberOfLines={1}>{deck.name}</Text>
          </View>
          <Text style={styles.cardCount}>{total} cards</Text>

          {/* Stats: labels on one baseline, numbers centered under each label */}
          <View style={styles.statsSection}>
            <View style={styles.labelsRow}>
              <Text style={[styles.statLabel, styles.statLabelRed]}>I didn't get</Text>
              <Text style={[styles.statLabel, styles.statLabelCenter]}>learned</Text>
              <Text style={[styles.statLabel, styles.statLabelGreen]}>I did get</Text>
            </View>
            <View style={styles.numbersRow}>
              <View style={styles.numberCell}>
                <AnimatedCounter value={didntGet} style={styles.statNumRed} />
              </View>
              <View style={styles.numberCell}>
                <Text style={[styles.learnedPct, learnedPct === 100 && styles.learnedPctComplete]}>
                  {learnedPct}<Text style={styles.pctSign}>%</Text>
                </Text>
              </View>
              <View style={styles.numberCell}>
                <AnimatedCounter value={didGet} style={styles.statNumGreen} />
              </View>
            </View>
          </View>

          {/* Trophy row — filled+colored when earned, grey outline when not */}
          <View style={styles.trophyRow}>
            {['bronze', 'silver', 'gold'].map(tier => (
              <Ionicons
                key={tier}
                name={deckTrophies[tier] ? 'trophy' : 'trophy-outline'}
                size={22}
                color={deckTrophies[tier] ? TROPHY_COLORS[tier] : '#ccc'}
              />
            ))}
          </View>

          {/* Remaining cards in circulation */}
          <Text style={styles.remainingText}>{circulation.length} in rotation</Text>
        </View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        {/* Hidden measurement texts */}
        <Text
          key={`f-${currentCard.index}`}
          style={[styles.measureText, { fontSize: frontSize }]}
          onTextLayout={handleFrontLayout}
        >
          {currentCard.front}
        </Text>
        <Text
          key={`b-${currentCard.index}`}
          style={[styles.measureText, { fontSize: backSize }]}
          onTextLayout={handleBackLayout}
        >
          {currentCard.back}
        </Text>

        {/* Prompt above card */}
        <View style={[styles.promptRow, { width: contentWidth }]}>
          <Text style={styles.promptText}>
            {showAnswer
              ? 'Did you get it?'
              : 'Think. If you know the answer, say it out loud.'}
          </Text>
        </View>

        {/* Card (single, content swaps at midpoint of flip) */}
        <TouchableOpacity
          activeOpacity={showAnswer ? 1 : 0.85}
          onPress={showAnswer ? undefined : flipToAnswer}
          style={{ width: contentWidth }}
        >
          <Animated.View
            style={[
              styles.card,
              { width: contentWidth },
              showAnswer && styles.cardAnswer,
              { transform: [{ scaleX: flipAnim }] },
            ]}
          >
            <View style={styles.cardContent}>
              {showAnswer ? (
                <>
                  <Text style={styles.questionPreview} numberOfLines={2}>
                    {currentCard.front}
                  </Text>
                  <View style={styles.cardSeparator} />
                  <Text style={[styles.answerText, { fontSize: backSize }]}>
                    {currentCard.back}
                  </Text>
                </>
              ) : (
                <Text style={[styles.questionText, { fontSize: frontSize }]}>
                  {currentCard.front}
                </Text>
              )}
            </View>
          </Animated.View>
        </TouchableOpacity>

        {/* Action buttons */}
        <View style={[styles.actionRow, { width: contentWidth }]}>
          {showAnswer ? (
            <>
              <TouchableOpacity style={styles.didntGetBtn} onPress={handleDidntGetIt}>
                <Text style={styles.didntGetText}>I didn't get it</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.gotItBtn} onPress={handleGotIt}>
                <Text style={styles.gotItText}>I got it</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.flipBtn} onPress={flipToAnswer}>
                <Text style={styles.flipText}>Flip</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

async function saveSessionData(totalGotten, perfectSession, deck, sessionMissCounts) {
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  // Header
  headerOuter: {
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  headerInner: {
    alignItems: 'center',
  },
  deckBox: {
    borderWidth: 1.5,
    borderColor: '#d0d0d0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 4,
    backgroundColor: '#fff',
    maxWidth: '100%',
  },
  deckName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
  },
  cardCount: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 12,
  },

  // Stats: two rows (labels share baseline; numbers centered under labels)
  statsSection: {
    width: '100%',
    marginBottom: 10,
  },
  labelsRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  statLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '500',
  },
  numbersRow: {
    flexDirection: 'row',
    width: '100%',
  },
  numberCell: {
    flex: 1,
    alignItems: 'center',
  },
  statLabelRed: { color: '#e05252' },
  statNumRed: { fontSize: 28, fontWeight: '700', color: '#e05252', lineHeight: 32 },
  statLabelGreen: { color: '#4caf50' },
  statNumGreen: { fontSize: 28, fontWeight: '700', color: '#4caf50', lineHeight: 32 },
  statLabelCenter: { color: '#888' },
  learnedPct: { fontSize: 36, fontWeight: '700', color: '#222', lineHeight: 40 },
  learnedPctComplete: { color: '#4caf50' },
  pctSign: { fontSize: 20 },

  // Trophy placeholders
  trophyRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  remainingText: {
    fontSize: 11,
    color: '#bbb',
    marginTop: 6,
  },

  // Body
  body: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 20,
  },

  // Off-screen measurement text
  measureText: {
    position: 'absolute',
    top: -9999,
    opacity: 0,
    textAlign: 'center',
    width: 280,
  },

  // Prompt
  promptRow: {
    alignItems: 'center',
    marginBottom: 16,
    minHeight: 38,
    justifyContent: 'center',
  },
  promptText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // Card
  card: {
    minHeight: 250,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardAnswer: {
    backgroundColor: '#5b6cdb',
  },
  cardContent: {
    width: '100%',
    alignItems: 'center',
  },
  questionText: {
    textAlign: 'center',
    color: '#222',
    fontWeight: '500',
  },
  questionPreview: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 6,
  },
  cardSeparator: {
    width: '40%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginBottom: 12,
  },
  answerText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '500',
  },

  // Action buttons
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  skipBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 100,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
  },
  skipText: {
    color: '#555',
    fontSize: 16,
    fontWeight: '600',
  },
  flipBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 100,
    backgroundColor: '#5b6cdb',
    alignItems: 'center',
  },
  flipText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  didntGetBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 100,
    backgroundColor: '#e05252',
    alignItems: 'center',
  },
  didntGetText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  gotItBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 100,
    backgroundColor: '#4caf50',
    alignItems: 'center',
  },
  gotItText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
