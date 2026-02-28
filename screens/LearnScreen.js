import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX_FONT = 24;
const MIN_FONT = 10;

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
    // Swap first with second to avoid repeat
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }
  return shuffled;
}

export default function LearnScreen({ route, navigation }) {
  const { deck } = route.params;
  const { width } = useWindowDimensions();

  const cardWidth = Math.min(width - 40, 640);

  // Tag each card with its original index for repeat-prevention
  const allCards = deck.cards.map((c, i) => ({ ...c, index: i }));

  // Circulation: cards still in play
  const [circulation, setCirculation] = useState(() => buildOrder(allCards, -1));
  const [queuePos, setQueuePos] = useState(0); // position in current shuffled order
  const [showAnswer, setShowAnswer] = useState(false);
  const [didGet, setDidGet] = useState(0);
  const [didntGet, setDidntGet] = useState(0);
  const [totalGotten, setTotalGotten] = useState(0);
  const [hasMissed, setHasMissed] = useState(false); // tracks if any "I didn't get it" this session
  const lastIdRef = useRef(-1);

  const total = allCards.length;
  const learnedPct = Math.round((totalGotten / total) * 100);

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
    if (h > 120 && frontSizeRef.current > MIN_FONT) {
      frontSizeRef.current -= 1;
      setFrontSize(frontSizeRef.current);
    }
  };

  const handleBackLayout = (e) => {
    const h = e.nativeEvent.lines.reduce((sum, l) => sum + l.height, 0);
    if (h > 80 && backSizeRef.current > MIN_FONT) {
      backSizeRef.current -= 1;
      setBackSize(backSizeRef.current);
    }
  };

  const advance = (newCirculation, removedIndex) => {
    resetFontSizes();
    setShowAnswer(false);

    const remaining = newCirculation;
    if (remaining.length === 0) return; // handled by caller

    const nextPos = queuePos + 1;
    if (nextPos >= remaining.length) {
      // End of current queue — rebuild with remaining cards
      const lastId = removedIndex ?? (currentCard?.index ?? -1);
      lastIdRef.current = lastId;
      setCirculation(buildOrder(remaining, lastId));
      setQueuePos(0);
    } else {
      setQueuePos(nextPos);
    }
  };

  const handleGotIt = async () => {
    const newCirculation = circulation.filter((_, i) => i !== queuePos);
    const newTotalGotten = totalGotten + 1;
    setDidGet(d => d + 1);
    setTotalGotten(newTotalGotten);

    if (newCirculation.length === 0) {
      // All cards gotten — go to completion
      await saveTrophies(newTotalGotten, !hasMissed, deck);
      navigation.replace('LearnComplete', {
        deck,
        didGet: didGet + 1,
        didntGet,
        hasMissed,
      });
      return;
    }

    advance(newCirculation, currentCard.index);
    setCirculation(newCirculation);
  };

  const handleDidntGetIt = () => {
    setDidntGet(d => d + 1);
    setHasMissed(true);
    advance(circulation, null);
  };

  const handleSkip = () => {
    advance(circulation, null);
  };

  const handlePrev = () => {
    if (queuePos === 0) return;
    resetFontSizes();
    setShowAnswer(false);
    setQueuePos(p => p - 1);
  };

  if (!currentCard) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Stats header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.deckName} numberOfLines={1}>{deck.name}</Text>
          <Text style={styles.cardCount}>{total} cards</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statLeft}>
            <Text style={styles.statLabelRed}>I didn't get</Text>
            <Text style={styles.statNumRed}>{didntGet}</Text>
          </View>

          <View style={styles.statCenter}>
            <Text style={styles.statLabelCenter}>learned</Text>
            <Text style={[styles.learnedPct, learnedPct === 100 && styles.learnedPctComplete]}>
              {learnedPct}<Text style={styles.pctSign}>%</Text>
            </Text>
          </View>

          <View style={styles.statRight}>
            <Text style={styles.statLabelGreen}>I did get</Text>
            <Text style={styles.statNumGreen}>{didGet}</Text>
          </View>
        </View>

        <View style={styles.trophyRow}>
          <Text style={styles.trophyPlaceholder}>🏆 No trophies yet</Text>
        </View>
      </View>

      {/* Card area */}
      <View style={styles.cardArea}>
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

        {/* Left chevron */}
        <TouchableOpacity
          style={[styles.chevron, styles.chevronLeft, queuePos === 0 && styles.chevronDisabled]}
          onPress={handlePrev}
          disabled={queuePos === 0}
        >
          <Text style={styles.chevronText}>‹</Text>
        </TouchableOpacity>

        {/* Card */}
        <View style={[styles.card, { width: cardWidth }, showAnswer && styles.cardAnswer]}>
          {showAnswer ? (
            <View style={styles.cardContent}>
              <Text style={[styles.questionPreview, { fontSize: Math.max(12, frontSize - 4) }]} numberOfLines={2}>
                {currentCard.front}
              </Text>
              <View style={styles.separator} />
              <Text style={[styles.answerText, { fontSize: backSize }]}>
                {currentCard.back}
              </Text>
            </View>
          ) : (
            <View style={styles.cardContent}>
              <Text style={[styles.questionText, { fontSize: frontSize }]}>
                {currentCard.front}
              </Text>
            </View>
          )}
        </View>

        {/* Right chevron */}
        <TouchableOpacity style={[styles.chevron, styles.chevronRight]} onPress={handleSkip}>
          <Text style={styles.chevronText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Prompt or action buttons */}
      {showAnswer ? (
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.didntGetBtn} onPress={handleDidntGetIt}>
            <Text style={styles.didntGetText}>I didn't get it</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gotItBtn} onPress={handleGotIt}>
            <Text style={styles.gotItText}>I got it</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.promptArea} onPress={() => setShowAnswer(true)}>
          <Text style={styles.promptText}>
            Think. If you know the answer, say it out loud.
          </Text>
          <Text style={styles.tapToReveal}>Tap to reveal →</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

async function saveTrophies(totalGotten, perfectSession, deck) {
  try {
    const stored = await AsyncStorage.getItem('decks');
    if (!stored) return;
    const decks = JSON.parse(stored);
    const idx = decks.findIndex(d => d.id === deck.id);
    if (idx === -1) return;

    const existing = decks[idx].trophies || {};
    const updated = { ...existing };

    // Bronze: first time reaching 100%
    if (!updated.bronze) updated.bronze = true;

    // Silver: first perfect session
    if (perfectSession && !updated.silver) updated.silver = true;
    // Gold: second perfect session (already had silver)
    else if (perfectSession && updated.silver && !updated.gold) updated.gold = true;

    decks[idx] = { ...decks[idx], trophies: updated };
    await AsyncStorage.setItem('decks', JSON.stringify(decks));
  } catch (_) {}
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  headerTop: {
    alignItems: 'center',
    marginBottom: 8,
  },
  deckName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
  },
  cardCount: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLeft: { alignItems: 'flex-start', flex: 1 },
  statCenter: { alignItems: 'center', flex: 1 },
  statRight: { alignItems: 'flex-end', flex: 1 },
  statLabelRed: { fontSize: 11, color: '#e05252', fontWeight: '500' },
  statNumRed: { fontSize: 28, fontWeight: '700', color: '#e05252', lineHeight: 32 },
  statLabelGreen: { fontSize: 11, color: '#4caf50', fontWeight: '500' },
  statNumGreen: { fontSize: 28, fontWeight: '700', color: '#4caf50', lineHeight: 32 },
  statLabelCenter: { fontSize: 11, color: '#888', fontWeight: '500' },
  learnedPct: { fontSize: 36, fontWeight: '700', color: '#222', lineHeight: 40 },
  learnedPctComplete: { color: '#4caf50' },
  pctSign: { fontSize: 20 },
  trophyRow: {
    alignItems: 'center',
  },
  trophyPlaceholder: {
    fontSize: 12,
    color: '#ccc',
  },
  cardArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  measureText: {
    position: 'absolute',
    top: -9999,
    opacity: 0,
    textAlign: 'center',
    width: 280,
  },
  chevron: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    zIndex: 1,
  },
  chevronLeft: { marginRight: -20 },
  chevronRight: { marginLeft: -20 },
  chevronDisabled: { opacity: 0.3 },
  chevronText: { fontSize: 22, color: '#555', lineHeight: 26 },
  card: {
    minHeight: 180,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 0,
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
    textAlign: 'center',
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '500',
    width: '100%',
  },
  separator: {
    width: '40%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: 10,
  },
  answerText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '500',
  },
  promptArea: {
    padding: 24,
    alignItems: 'center',
  },
  promptText: {
    fontSize: 15,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 6,
  },
  tapToReveal: {
    fontSize: 13,
    color: '#aaa',
  },
  actionRow: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  didntGetBtn: {
    flex: 1,
    backgroundColor: '#e05252',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  didntGetText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  gotItBtn: {
    flex: 1,
    backgroundColor: '#4caf50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  gotItText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
