import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows, radius } from '../constants/theme';

const MAX_CONTENT_WIDTH = 680;

export default function EditDeckScreen({ route, navigation }) {
  const { deck } = route.params;

  const [deckName, setDeckName] = useState(deck.name);
  const [cards, setCards] = useState(
    deck.cards.map((c, i) => ({ ...c, key: String(i) }))
  );
  const [deleteTarget, setDeleteTarget] = useState(null); // index to delete

  const updateCard = (index, field, value) => {
    const updated = [...cards];
    updated[index] = { ...updated[index], [field]: value };
    setCards(updated);
  };

  const addCard = () => {
    setCards([...cards, { front: '', back: '', key: String(Date.now()) }]);
  };

  const confirmDelete = (index) => {
    if (cards.length === 1) return; // always keep at least one card
    setDeleteTarget(index);
  };

  const doDelete = () => {
    setCards(cards.filter((_, i) => i !== deleteTarget));
    setDeleteTarget(null);
  };

  const save = async () => {
    const validCards = cards
      .map(({ key, ...rest }) => rest)          // strip key before saving
      .filter(c => c.front.trim() || c.back.trim());

    if (validCards.length === 0) return;

    try {
      const stored = await AsyncStorage.getItem('decks');
      const decks = stored ? JSON.parse(stored) : [];
      const updated = decks.map(d =>
        d.id === deck.id
          ? { ...d, name: deckName.trim() || d.name, cards: validCards }
          : d
      );
      await AsyncStorage.setItem('decks', JSON.stringify(updated));
      navigation.goBack();
    } catch (e) {
      // silent — user stays on screen
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerSide}>
            <Ionicons name="arrow-back" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
          <TextInput
            style={styles.deckNameInput}
            value={deckName}
            onChangeText={setDeckName}
            selectTextOnFocus
            returnKeyType="done"
            maxLength={80}
          />
          <TouchableOpacity onPress={save} style={styles.headerSide}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* Card list */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {cards.map((card, index) => (
            <View key={card.key} style={styles.cardBlock}>
              <View style={styles.cardBlockHeader}>
                <Text style={styles.cardIndex}>Card {index + 1}</Text>
                <TouchableOpacity
                  onPress={() => confirmDelete(index)}
                  disabled={cards.length === 1}
                  style={[styles.deleteBtn, cards.length === 1 && styles.deleteBtnDisabled]}
                >
                  <Ionicons
                    name="trash-outline"
                    size={17}
                    color={cards.length === 1 ? colors.borderLight : colors.danger}
                  />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.cardInput}
                placeholder="Front (question)"
                placeholderTextColor={colors.textMuted}
                value={card.front}
                onChangeText={v => updateCard(index, 'front', v)}
                multiline
                maxLength={1000}
              />
              <View style={styles.separator} />
              <TextInput
                style={styles.cardInput}
                placeholder="Back (answer)"
                placeholderTextColor={colors.textMuted}
                value={card.back}
                onChangeText={v => updateCard(index, 'back', v)}
                multiline
                maxLength={1000}
              />
            </View>
          ))}

          <TouchableOpacity style={styles.addBtn} onPress={addCard}>
            <Ionicons name="add-circle-outline" size={18} color={colors.brand} />
            <Text style={styles.addBtnText}>Add card</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Delete confirmation */}
      <Modal visible={deleteTarget !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Delete card?</Text>
            <Text style={styles.modalMessage}>This card will be removed from the deck.</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setDeleteTarget(null)} style={styles.modalBtn}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={doDelete} style={styles.modalBtn}>
                <Text style={styles.modalDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerSide: { minWidth: 56, alignItems: 'center', padding: 6 },
  deckNameInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.textPrimary,
    paddingVertical: 4,
  },
  saveText: { color: colors.brand, fontWeight: '700', fontSize: 16 },

  scroll: { flex: 1 },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },

  cardBlock: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: 14,
    ...shadows.sm,
    overflow: 'hidden',
  },
  cardBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 4,
  },
  cardIndex: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  deleteBtn: { padding: 4 },
  deleteBtnDisabled: { opacity: 0.3 },

  cardInput: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textPrimary,
    minHeight: 44,
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: 14,
  },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: colors.brand,
    borderRadius: radius.md,
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    justifyContent: 'center',
  },
  addBtnText: { color: colors.brand, fontSize: 15, fontWeight: '600' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 24,
    width: '80%',
    maxWidth: 340,
  },
  modalTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 },
  modalMessage: { fontSize: 14, color: colors.textSecondary, marginBottom: 20, lineHeight: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalBtn: { padding: 8 },
  modalCancelText: { fontSize: 16, color: colors.textSecondary },
  modalDeleteText: { fontSize: 16, color: colors.danger, fontWeight: '600' },
});
