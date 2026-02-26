import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, SafeAreaView,
  Alert, ActionSheetIOS, useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX_FONT = 22;
const MIN_FONT = 10;
// Vertical space consumed by the back-face question preview + separator
const BACK_PREVIEW_H = 52;
// Chrome heights inside the card (top bar + counter)
const TOP_BAR_H = 36;
const COUNTER_H = 22;
// Card-page vertical padding (16 top + 16 bottom)
const PAGE_PAD_V = 32;
// Card vertical padding (paddingTop 4 + paddingBottom 12)
const CARD_PAD_V = 16;

export default function ManualCreateScreen({ navigation }) {
  const { width: screenWidth } = useWindowDimensions();

  // Card area height = 135% of the landscape ratio established last iteration
  const cardAreaMaxHeight = Math.round(((screenWidth - 32) * 0.65 + 32) * 1.35);

  // Available height for the editable text content inside the card.
  // Card height = cardAreaMaxHeight - PAGE_PAD_V
  // Content area = card height - CARD_PAD_V - TOP_BAR_H - COUNTER_H
  const CONTENT_H = Math.max(60, cardAreaMaxHeight - PAGE_PAD_V - CARD_PAD_V - TOP_BAR_H - COUNTER_H);
  const CONTENT_H_BACK = Math.max(40, CONTENT_H - BACK_PREVIEW_H);

  const cardIdCounter = useRef(1);
  const newCard = () => ({ id: `c${cardIdCounter.current++}`, front: '', back: '' });

  const [deckName, setDeckName] = useState('Untitled deck');
  const [cards, setCards] = useState([{ id: 'c0', front: '', back: '' }]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  // Per card-face font size, keyed by `${card.id}-${side}`
  const [fontSizes, setFontSizes] = useState({});
  const fontSizeRefs = useRef({});
  const scrollRef = useRef(null);

  const getKey = (cardId, side) => `${cardId}-${side}`;
  const getFontSize = (cardId, side) => fontSizes[getKey(cardId, side)] ?? MAX_FONT;

  const setFontSize = (cardId, side, size) => {
    const key = getKey(cardId, side);
    fontSizeRefs.current[key] = size;
    setFontSizes(prev => ({ ...prev, [key]: size }));
  };

  // Called by each TextInput's onContentSizeChange.
  // contentH = natural height of all text at current font size.
  // availH   = vertical space the text must fit within.
  // Steps font down when overflowing, back up when there's lots of room.
  const handleContentSizeChange = (cardId, side, hasFrontText, e) => {
    const { height: contentH } = e.nativeEvent.contentSize;
    const availH = (side === 'back' && hasFrontText) ? CONTENT_H_BACK : CONTENT_H;
    const currentSize = fontSizeRefs.current[getKey(cardId, side)] ?? MAX_FONT;

    if (contentH > availH * 0.95 && currentSize > MIN_FONT) {
      setFontSize(cardId, side, currentSize - 1);
    } else if (contentH < availH * 0.50 && currentSize < MAX_FONT) {
      setFontSize(cardId, side, currentSize + 1);
    }
  };

  // Pages: c0-front, c0-back, c1-front, c1-back, …, ghost
  const totalPages = cards.length * 2 + 1;
  const lastRealPageIndex = cards.length * 2 - 1;
  const isOnLastRealPage = currentPageIndex === lastRealPageIndex;
  const isAtStart = currentPageIndex === 0;

  const updateCard = (cardIndex, side, value) => {
    const updated = [...cards];
    updated[cardIndex] = { ...updated[cardIndex], [side]: value };
    setCards(updated);
    if (!value) setFontSize(cards[cardIndex].id, side, MAX_FONT);
  };

  const addCard = () => {
    const card = newCard();
    const newCards = [...cards, card];
    setCards(newCards);
    const newPageIndex = (newCards.length - 1) * 2;
    setCurrentPageIndex(newPageIndex);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ x: newPageIndex * cardWidth, animated: true });
    }, 50);
  };

  const deleteCard = (cardIndex) => {
    const card = cards[cardIndex];
    if (cards.length === 1) {
      setFontSize(card.id, 'front', MAX_FONT);
      setFontSize(card.id, 'back', MAX_FONT);
      setCards([{ ...card, front: '', back: '' }]);
      setCurrentPageIndex(0);
      scrollRef.current?.scrollTo({ x: 0, animated: false });
      return;
    }
    const updated = cards.filter((_, i) => i !== cardIndex);
    const targetCardIndex = Math.min(cardIndex, updated.length - 1);
    const targetPageIndex = targetCardIndex * 2;
    setCards(updated);
    setCurrentPageIndex(targetPageIndex);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ x: targetPageIndex * cardWidth, animated: false });
    }, 50);
  };

  const showCardMenu = (cardIndex) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Cancel', 'Delete card'], destructiveButtonIndex: 1, cancelButtonIndex: 0 },
        (i) => { if (i === 1) deleteCard(cardIndex); }
      );
    } else {
      Alert.alert('', '', [
        { text: 'Delete card', style: 'destructive', onPress: () => deleteCard(cardIndex) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const goTo = (pageIndex) => {
    if (pageIndex < 0 || pageIndex >= totalPages) return;
    setCurrentPageIndex(pageIndex);
    scrollRef.current?.scrollTo({ x: pageIndex * cardWidth, animated: true });
  };

  const handleScrollEnd = (e) => {
    if (cardWidth === 0) return;
    const pageIndex = Math.round(e.nativeEvent.contentOffset.x / cardWidth);
    if (pageIndex >= cards.length * 2) { addCard(); return; }
    if (pageIndex >= 0) setCurrentPageIndex(pageIndex);
  };

  const saveDeck = async () => {
    const validCards = cards
      .filter(c => c.front.trim() || c.back.trim())
      .map(({ id, ...rest }) => rest);
    if (validCards.length === 0) {
      Alert.alert('No cards', 'Add at least one card before saving.');
      return;
    }
    try {
      const stored = await AsyncStorage.getItem('decks');
      const decks = stored ? JSON.parse(stored) : [];
      const newDeck = {
        id: Date.now().toString(),
        name: deckName.trim() || 'Untitled deck',
        cards: validCards,
        frontColor: '#FFFFFF',
        backColor: '#4a90e2',
        isNew: true,
        createdAt: Date.now(),
      };
      await AsyncStorage.setItem('decks', JSON.stringify([...decks, newDeck]));
      navigation.navigate('Home');
    } catch {
      Alert.alert('Error', 'Could not save deck.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <TextInput
            style={styles.deckNameInput}
            value={deckName}
            onChangeText={setDeckName}
            selectTextOnFocus
            returnKeyType="done"
            maxLength={80}
          />
          <TouchableOpacity onPress={saveDeck} style={styles.headerBtn}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* ── Card area ── */}
        <View
          style={[styles.cardArea, { maxHeight: cardAreaMaxHeight }]}
          onLayout={e => setCardWidth(e.nativeEvent.layout.width)}
        >
          {cardWidth > 0 && (
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleScrollEnd}
              scrollEventThrottle={16}
              decelerationRate="fast"
              style={styles.scrollView}
            >
              {Array.from({ length: totalPages }).map((_, pageIndex) => {
                // Ghost page — silent swipe target for add-card gesture
                if (pageIndex === totalPages - 1) {
                  return <View key="ghost" style={{ width: cardWidth }} />;
                }

                const cardIndex = Math.floor(pageIndex / 2);
                const side = pageIndex % 2 === 0 ? 'front' : 'back';
                const card = cards[cardIndex];
                const isBack = side === 'back';
                const hasFrontText = isBack && !!card.front.trim();
                const cardBg = isBack ? '#4a90e2' : '#FFFFFF';
                const textColor = isBack ? '#fff' : '#222';
                const chromeColor = isBack ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.2)';
                const placeholderColor = isBack ? 'rgba(255,255,255,0.35)' : '#bbb';
                const fontSize = getFontSize(card.id, side);

                return (
                  <View key={pageIndex} style={[styles.cardPage, { width: cardWidth }]}>
                    <View style={[styles.card, { backgroundColor: cardBg }]}>

                      {/* Top bar: Front/Back label (left) + ••• menu (right) */}
                      <View style={styles.cardTopBar}>
                        <Text style={[styles.cardChrome, { color: chromeColor }]}>
                          {isBack ? 'Back' : 'Front'}
                        </Text>
                        <View style={{ flex: 1 }} />
                        <TouchableOpacity
                          style={styles.cardMenuBtn}
                          onPress={() => showCardMenu(cardIndex)}
                          hitSlop={{ top: 8, right: 8, bottom: 8, left: 16 }}
                        >
                          <Text style={[styles.cardMenuIcon, { color: chromeColor }]}>
                            •••
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* Content area — centers children vertically */}
                      <View style={styles.cardContentArea}>
                        {hasFrontText ? (
                          <View style={styles.backPreview}>
                            <Text style={styles.cardBackQuestion} numberOfLines={2}>
                              {card.front}
                            </Text>
                            <View style={styles.cardBackSeparator} />
                          </View>
                        ) : null}

                        {/* TextInput — auto-sizes to content; onContentSizeChange drives font scaling */}
                        <TextInput
                          style={[styles.cardInput, { color: textColor, fontSize }]}
                          value={side === 'front' ? card.front : card.back}
                          onChangeText={v => updateCard(cardIndex, side, v)}
                          onContentSizeChange={e =>
                            handleContentSizeChange(card.id, side, hasFrontText, e)
                          }
                          placeholder={side === 'front' ? 'Type a question' : 'Type an answer'}
                          placeholderTextColor={placeholderColor}
                          multiline
                          scrollEnabled={false}
                          maxLength={1000}
                        />
                      </View>

                      {/* Bottom chrome: x/y counter */}
                      <Text style={[styles.cardChrome, { color: chromeColor }]}>
                        {cardIndex + 1}/{cards.length}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}

          {/* Floating left arrow */}
          <View style={[styles.arrowOverlay, styles.arrowLeft]} pointerEvents="box-none">
            <TouchableOpacity
              style={[styles.arrowCircle, isAtStart && styles.arrowCircleDisabled]}
              onPress={() => goTo(currentPageIndex - 1)}
              disabled={isAtStart}
            >
              <Text style={[styles.arrowText, isAtStart && styles.arrowTextDisabled]}>‹</Text>
            </TouchableOpacity>
          </View>

          {/* Floating right arrow — blue + on back of last card */}
          <View style={[styles.arrowOverlay, styles.arrowRight]} pointerEvents="box-none">
            {isOnLastRealPage ? (
              <TouchableOpacity style={styles.arrowCircleAdd} onPress={addCard}>
                <Text style={styles.arrowTextAdd}>+</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.arrowCircle} onPress={() => goTo(currentPageIndex + 1)}>
                <Text style={styles.arrowText}>›</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerSpacer: { minWidth: 52, paddingHorizontal: 6 },
  headerBtn: { padding: 6, minWidth: 52, alignItems: 'flex-end' },
  deckNameInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    color: '#222',
    paddingVertical: 4,
  },
  doneText: { color: '#4a90e2', fontWeight: '700', fontSize: 16 },

  // Card area
  cardArea: { flex: 1, position: 'relative' },
  scrollView: { flex: 1 },

  cardPage: {
    height: '100%',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  card: {
    flex: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  // Top bar: Front/Back label on left, ••• on right
  cardTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    height: TOP_BAR_H,
  },

  // Shared chrome style (Front/Back label, x/y counter, ••• icon)
  cardChrome: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  cardMenuBtn: { padding: 8 },
  cardMenuIcon: {
    fontSize: 15,
    letterSpacing: 1,
  },

  // Content area — centers TextInput (and optional back preview) vertically
  cardContentArea: {
    flex: 1,
    justifyContent: 'center',
  },

  // Back face: question preview above answer input
  backPreview: { alignItems: 'center', marginBottom: 8 },
  cardBackQuestion: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    marginBottom: 6,
  },
  cardBackSeparator: {
    width: '40%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },

  // Text input — auto-sizes to content (no fixed height, no flex)
  // justifyContent: 'center' on the parent handles vertical centering
  cardInput: {
    width: '100%',
    textAlign: 'center',
    fontWeight: '500',
    backgroundColor: 'transparent',
  },

  // Floating nav arrows
  arrowOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    pointerEvents: 'box-none',
  },
  arrowLeft: { left: 8 },
  arrowRight: { right: 8 },

  arrowCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  arrowCircleDisabled: { opacity: 0.25 },
  arrowText: { fontSize: 26, color: '#4a90e2', lineHeight: 30 },
  arrowTextDisabled: { color: '#aaa' },

  arrowCircleAdd: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4a90e2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  arrowTextAdd: { fontSize: 24, color: '#fff', fontWeight: '700', lineHeight: 28 },
});
