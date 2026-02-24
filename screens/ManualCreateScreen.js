import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FRONT_COLORS = ['#FFFFFF', '#FFFDE7', '#E8F5E9', '#E3F2FD', '#FCE4EC', '#F3E5F5', '#FFF3E0', '#E0F7FA'];
const BACK_COLORS = ['#4a90e2', '#1565C0', '#2E7D32', '#E65100', '#6A1B9A', '#C62828', '#37474F', '#00695C'];

export default function ManualCreateScreen({ navigation }) {
  const [deckName, setDeckName] = useState('Untitled deck');
  const [cards, setCards] = useState([{ front: '', back: '' }]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeSide, setActiveSide] = useState('front');
  const [frontColor, setFrontColor] = useState('#FFFFFF');
  const [backColor, setBackColor] = useState('#4a90e2');
  const [showColors, setShowColors] = useState(false);
  const [cardWidth, setCardWidth] = useState(0);
  const scrollRef = useRef(null);

  const updateCard = (index, side, value) => {
    const updated = [...cards];
    updated[index] = { ...updated[index], [side]: value };
    setCards(updated);
  };

  const addCard = () => {
    const newCards = [...cards, { front: '', back: '' }];
    setCards(newCards);
    const newIndex = newCards.length - 1;
    setCurrentIndex(newIndex);
    setActiveSide('front');
    setTimeout(() => {
      scrollRef.current?.scrollTo({ x: newIndex * cardWidth, animated: true });
    }, 50);
  };

  const removeCurrentCard = () => {
    if (cards.length === 1) {
      updateCard(0, 'front', '');
      updateCard(0, 'back', '');
      return;
    }
    Alert.alert('Remove this card?', '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: () => {
          const updated = cards.filter((_, i) => i !== currentIndex);
          const newIndex = Math.min(currentIndex, updated.length - 1);
          setCards(updated);
          setCurrentIndex(newIndex);
          setTimeout(() => {
            scrollRef.current?.scrollTo({ x: newIndex * cardWidth, animated: false });
          }, 50);
        }
      }
    ]);
  };

  const goTo = (index) => {
    if (index < 0 || index >= cards.length) return;
    setCurrentIndex(index);
    setActiveSide('front');
    scrollRef.current?.scrollTo({ x: index * cardWidth, animated: true });
  };

  const handleScrollEnd = (e) => {
    if (cardWidth === 0) return;
    const index = Math.round(e.nativeEvent.contentOffset.x / cardWidth);
    if (index !== currentIndex && index >= 0 && index < cards.length) {
      setCurrentIndex(index);
      setActiveSide('front');
    }
  };

  const saveDeck = async () => {
    const validCards = cards.filter(c => c.front.trim() || c.back.trim());
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
        frontColor,
        backColor,
        isNew: true,
        createdAt: Date.now(),
      };
      await AsyncStorage.setItem('decks', JSON.stringify([...decks, newDeck]));
      navigation.navigate('Home');
    } catch (e) {
      Alert.alert('Error', 'Could not save deck.');
    }
  };

  const cardBg = activeSide === 'front' ? frontColor : backColor;
  const isBackDark = activeSide === 'back';
  const textColor = isBackDark ? '#fff' : '#222';
  const placeholderColor = isBackDark ? 'rgba(255,255,255,0.45)' : '#ccc';

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>✕</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.deckNameInput}
            value={deckName}
            onChangeText={setDeckName}
            selectTextOnFocus
            returnKeyType="done"
            maxLength={80}
          />
          <TouchableOpacity onPress={saveDeck} style={styles.headerBtn}>
            <Text style={[styles.headerBtnText, styles.doneText]}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Card counter */}
        <Text style={styles.counter}>Card {currentIndex + 1} of {cards.length}</Text>

        {/* Front / Back tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeSide === 'front' && styles.tabActive]}
            onPress={() => setActiveSide('front')}
          >
            <Text style={[styles.tabText, activeSide === 'front' && styles.tabTextActive]}>Front</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeSide === 'back' && styles.tabActive]}
            onPress={() => setActiveSide('back')}
          >
            <Text style={[styles.tabText, activeSide === 'back' && styles.tabTextActive]}>Back</Text>
          </TouchableOpacity>
        </View>

        {/* Card swipe area */}
        <View
          style={styles.cardArea}
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
            >
              {cards.map((card, i) => (
                <View key={i} style={[styles.cardPage, { width: cardWidth }]}>
                  <View style={[styles.card, { backgroundColor: cardBg }]}>
                    {activeSide === 'back' && card.front.trim() ? (
                      <>
                        <Text style={styles.cardBackQuestion} numberOfLines={2}>
                          {card.front}
                        </Text>
                        <View style={styles.cardBackSeparator} />
                      </>
                    ) : null}
                    <TextInput
                      style={[styles.cardInput, { color: textColor }]}
                      value={activeSide === 'front' ? card.front : card.back}
                      onChangeText={v => updateCard(i, activeSide, v)}
                      placeholder={activeSide === 'front' ? 'Type the question…' : 'Type the answer…'}
                      placeholderTextColor={placeholderColor}
                      multiline
                      maxLength={1000}
                      scrollEnabled={false}
                    />
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Dot indicators + prev / next */}
        <View style={styles.navRow}>
          <TouchableOpacity
            onPress={() => goTo(currentIndex - 1)}
            style={styles.navArrow}
            disabled={currentIndex === 0}
          >
            <Text style={[styles.navArrowText, currentIndex === 0 && styles.navDisabled]}>‹</Text>
          </TouchableOpacity>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dots}>
            {cards.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => goTo(i)}>
                <View style={[styles.dot, i === currentIndex && styles.dotActive]} />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            onPress={() => goTo(currentIndex + 1)}
            style={styles.navArrow}
            disabled={currentIndex === cards.length - 1}
          >
            <Text style={[styles.navArrowText, currentIndex === cards.length - 1 && styles.navDisabled]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Action row */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={addCard}>
            <Text style={styles.actionBtnText}>+ Add card</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, showColors && styles.actionBtnActive]}
            onPress={() => setShowColors(s => !s)}
          >
            <Text style={[styles.actionBtnText, showColors && styles.actionBtnActiveText]}>🎨 Colors</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={removeCurrentCard}>
            <Text style={[styles.actionBtnText, styles.removeText]}>Remove</Text>
          </TouchableOpacity>
        </View>

        {/* Color picker */}
        {showColors && (
          <View style={styles.colorPicker}>
            <Text style={styles.colorLabel}>Front color</Text>
            <View style={styles.colorRow}>
              {FRONT_COLORS.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.swatch, { backgroundColor: c }, frontColor === c && styles.swatchSelected]}
                  onPress={() => setFrontColor(c)}
                />
              ))}
            </View>
            <Text style={styles.colorLabel}>Back color</Text>
            <View style={styles.colorRow}>
              {BACK_COLORS.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.swatch, { backgroundColor: c }, backColor === c && styles.swatchSelected]}
                  onPress={() => setBackColor(c)}
                />
              ))}
            </View>
          </View>
        )}
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
  headerBtn: { padding: 6, minWidth: 52, alignItems: 'center' },
  headerBtnText: { fontSize: 18, color: '#888' },
  doneText: { color: '#4a90e2', fontWeight: '700', fontSize: 16 },
  deckNameInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    color: '#222',
    paddingVertical: 4,
  },

  // Counter
  counter: {
    textAlign: 'center',
    fontSize: 13,
    color: '#888',
    marginTop: 14,
    marginBottom: 10,
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: '#e8e8e8',
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 28,
    paddingVertical: 7,
    borderRadius: 8,
  },
  tabActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: '600', color: '#888' },
  tabTextActive: { color: '#222' },

  // Card area
  cardArea: { flex: 1 },
  cardPage: {
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 16,
    padding: 24,
    minHeight: 200,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  cardBackQuestion: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    marginBottom: 4,
  },
  cardBackSeparator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginBottom: 12,
    marginHorizontal: 20,
  },
  cardInput: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    minHeight: 80,
    backgroundColor: 'transparent',
  },

  // Navigation
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  navArrow: { padding: 8 },
  navArrowText: { fontSize: 32, color: '#4a90e2', lineHeight: 36 },
  navDisabled: { color: '#ccc' },
  dots: { flexGrow: 1, justifyContent: 'center', flexDirection: 'row', gap: 8, paddingHorizontal: 8 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#ccc' },
  dotActive: { backgroundColor: '#4a90e2', width: 18 },

  // Action row
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  actionBtnActive: { backgroundColor: '#4a90e2', borderColor: '#4a90e2' },
  actionBtnText: { fontSize: 14, fontWeight: '600', color: '#444' },
  actionBtnActiveText: { color: '#fff' },
  removeText: { color: '#cc3333' },

  // Color picker
  colorPicker: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  colorLabel: { fontSize: 12, fontWeight: '700', color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  colorRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchSelected: {
    borderColor: '#4a90e2',
    transform: [{ scale: 1.15 }],
  },
});
