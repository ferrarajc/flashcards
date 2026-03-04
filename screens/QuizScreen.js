import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, useWindowDimensions,
  Alert, SafeAreaView
} from 'react-native';
import { colors, shadows, radius } from '../constants/theme';

const CARD_PADDING = 24;
const MAX_CARD_WIDTH = 640;
const MAX_FONT = 28;
const MIN_FONT = 8;
const BACK_QUESTION_AREA = 52;

export default function QuizScreen({ route, navigation }) {
  const { deck } = route.params;
  const { width, height } = useWindowDimensions();

  const cardWidth = Math.min(width - 40, MAX_CARD_WIDTH);
  const cardHeight = height * 0.45;
  const textWidth = cardWidth - CARD_PADDING * 2;

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [frontSize, setFrontSize] = useState(MAX_FONT);
  const [backSize, setBackSize] = useState(MAX_FONT);
  const frontSizeRef = useRef(MAX_FONT);
  const backSizeRef = useRef(MAX_FONT);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const availableHeight = useRef(cardHeight - CARD_PADDING * 2);

  const card = deck.cards[index];
  const isLast = index === deck.cards.length - 1;

  const prevIndex = useRef(index);
  if (prevIndex.current !== index) {
    prevIndex.current = index;
    frontSizeRef.current = MAX_FONT;
    backSizeRef.current = MAX_FONT;
  }

  const handleFrontLayout = useCallback((e) => {
    const h = e.nativeEvent.lines.reduce((sum, l) => sum + l.height, 0);
    if (h > availableHeight.current && frontSizeRef.current > MIN_FONT) {
      frontSizeRef.current -= 1;
      setFrontSize(frontSizeRef.current);
    }
  }, []);

  const handleBackLayout = useCallback((e) => {
    const h = e.nativeEvent.lines.reduce((sum, l) => sum + l.height, 0);
    const backAvailable = availableHeight.current - BACK_QUESTION_AREA;
    if (h > backAvailable && backSizeRef.current > MIN_FONT) {
      backSizeRef.current -= 1;
      setBackSize(backSizeRef.current);
    }
  }, []);

  const handleCardLayout = (e) => {
    const cardH = e.nativeEvent.layout.height;
    if (cardH > 0) availableHeight.current = cardH - CARD_PADDING * 2;
  };

  const flip = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    setTimeout(() => setFlipped(f => !f), 150);
  };

  const next = () => {
    if (isLast) {
      navigation.replace('End', { deckName: deck.name, total: deck.cards.length });
    } else {
      scaleAnim.setValue(1);
      setFlipped(false);
      frontSizeRef.current = MAX_FONT;
      backSizeRef.current = MAX_FONT;
      setFrontSize(MAX_FONT);
      setBackSize(MAX_FONT);
      setIndex(i => i + 1);
    }
  };

  const exitQuiz = () => {
    Alert.alert(
      'Exit session?',
      "Your progress won't be saved.",
      [
        { text: 'Keep going', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: () => navigation.navigate('Home') },
      ]
    );
  };

  const isBack = flipped;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Hidden measurement texts */}
        <Text
          key={`f-${index}`}
          style={[styles.measureText, { fontSize: frontSize, width: textWidth }]}
          onTextLayout={handleFrontLayout}
        >
          {card.front}
        </Text>
        <Text
          key={`b-${index}`}
          style={[styles.measureText, { fontSize: backSize, width: textWidth }]}
          onTextLayout={handleBackLayout}
        >
          {card.back}
        </Text>

        <TouchableOpacity style={styles.closeBtn} onPress={exitQuiz}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        <Text style={styles.progress}>{index + 1} / {deck.cards.length}</Text>
        <Text style={styles.deckName}>{deck.name}</Text>
        <Text style={styles.hint}>{isBack ? 'Showing: Answer' : 'Tap card to flip'}</Text>

        <TouchableOpacity
          onPress={flip}
          activeOpacity={0.9}
          style={[styles.cardContainer, { width: cardWidth, height: cardHeight }]}
        >
          <Animated.View
            style={[
              styles.card,
              isBack ? styles.cardBack : styles.cardFront,
              { transform: [{ scaleX: scaleAnim }] },
            ]}
            onLayout={handleCardLayout}
          >
            {isBack ? (
              <View style={styles.backContent}>
                <Text style={styles.backQuestion} numberOfLines={2}>{card.front}</Text>
                <View style={styles.backSeparator} />
                <Text style={[styles.cardText, { fontSize: backSize, color: colors.surface }]}>
                  {card.back}
                </Text>
              </View>
            ) : (
              <Text style={[styles.cardText, { fontSize: frontSize, color: colors.textPrimary }]}>
                {card.front}
              </Text>
            )}
          </Animated.View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={next}>
          <Text style={styles.nextButtonText}>{isLast ? 'Finish' : 'Next →'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  measureText: {
    position: 'absolute',
    top: -9999,
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0,
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    left: 16,
    padding: 8,
  },
  closeText: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  progress: { fontSize: 14, color: colors.textSecondary, marginBottom: 4 },
  deckName: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  hint: { fontSize: 13, color: colors.textMuted, marginBottom: 20 },
  cardContainer: {},
  card: {
    width: '100%',
    height: '100%',
    borderRadius: radius.lg,
    padding: CARD_PADDING,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  cardFront: { backgroundColor: colors.surface },
  cardBack:  { backgroundColor: colors.cardBack },
  backContent: {
    width: '100%',
    alignItems: 'center',
  },
  backQuestion: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    fontWeight: '500',
    width: '100%',
  },
  backSeparator: {
    width: '40%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: 10,
  },
  cardText: {
    textAlign: 'center',
    fontWeight: '500',
    width: '100%',
  },
  nextButton: {
    marginTop: 32,
    backgroundColor: colors.brand,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: radius.md,
  },
  nextButtonText: { color: colors.surface, fontSize: 18, fontWeight: '600' },
});
