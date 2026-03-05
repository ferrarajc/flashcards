import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Modal, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import SidebarLayout from '../components/SidebarLayout';
import ScreenContainer from '../components/ScreenContainer';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { colors, shadows, radius } from '../constants/theme';

const TROPHY_COLORS = colors.trophy;
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

export default function HomeScreen({ navigation }) {
  const [decks, setDecks] = useState([]);
  const [sortAlpha, setSortAlpha] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Deck action sheet
  const [menuDeck, setMenuDeck] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);

  // Rename modal
  const [renameVisible, setRenameVisible] = useState(false);
  const [renameDeckId, setRenameDeckId] = useState(null);
  const [renameText, setRenameText] = useState('');

  // Delete confirm modal
  const [deleteDeck, setDeleteDeck] = useState(null);

  const { isPhone } = useBreakpoint();

  const loadDecks = async () => {
    try {
      const stored = await AsyncStorage.getItem('decks');
      if (!stored) return;
      const parsed = JSON.parse(stored);
      const now = Date.now();
      const updated = parsed.map(d =>
        d.isNew && d.createdAt && now - d.createdAt > SEVEN_DAYS
          ? { ...d, isNew: false }
          : d
      );
      const anyExpired = updated.some((d, i) => d.isNew !== parsed[i].isNew);
      if (anyExpired) await AsyncStorage.setItem('decks', JSON.stringify(updated));
      setDecks(updated);
    } catch (e) {
      console.error(e);
    }
  };

  useFocusEffect(useCallback(() => { loadDecks(); }, []));

  useEffect(() => {
    navigation.setOptions({
      headerLeft: isPhone ? () => (
        <TouchableOpacity onPress={() => setSidebarOpen(true)} style={styles.hamburgerBtn}>
          <Ionicons name="menu" size={26} color={colors.surface} />
        </TouchableOpacity>
      ) : () => null,
    });
  }, [isPhone, navigation]);

  const saveDecks = async (updated) => {
    setDecks(updated);
    await AsyncStorage.setItem('decks', JSON.stringify(updated));
  };

  // Opens a deck: clears new badge + stamps lastAccessedAt in one write
  const openDeck = (deck) => {
    const now = Date.now();
    const updated = decks.map(d =>
      d.id === deck.id ? { ...d, isNew: false, lastAccessedAt: now } : d
    );
    saveDecks(updated);
    navigation.navigate('ModeSelect', { deck: { ...deck, isNew: false, lastAccessedAt: now } });
  };

  const closeMenu = () => setMenuVisible(false);

  const startRename = (deck) => {
    closeMenu();
    setRenameDeckId(deck.id);
    setRenameText(deck.name);
    setRenameVisible(true);
  };

  const confirmRename = async () => {
    if (!renameText.trim()) return;
    const updated = decks.map(d =>
      d.id === renameDeckId ? { ...d, name: renameText.trim() } : d
    );
    await saveDecks(updated);
    setRenameVisible(false);
  };

  const confirmDelete = async () => {
    await saveDecks(decks.filter(d => d.id !== deleteDeck.id));
    setDeleteDeck(null);
  };

  // Sort: new-badged first → lastAccessedAt desc → createdAt desc; or A–Z
  const sortedDecks = [...decks].sort((a, b) => {
    if (sortAlpha) return a.name.localeCompare(b.name);
    if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;
    const aTime = a.lastAccessedAt || a.createdAt || 0;
    const bTime = b.lastAccessedAt || b.createdAt || 0;
    return bTime - aTime;
  });

  const menuActions = menuDeck ? [
    {
      label: 'Study',
      icon: 'play-circle-outline',
      onPress: () => { closeMenu(); openDeck(menuDeck); },
    },
    {
      label: 'Rename',
      icon: 'pencil-outline',
      onPress: () => startRename(menuDeck),
    },
    {
      label: 'Edit cards',
      icon: 'create-outline',
      onPress: () => { closeMenu(); navigation.navigate('EditDeck', { deck: menuDeck }); },
    },
    {
      label: 'Delete',
      icon: 'trash-outline',
      danger: true,
      onPress: () => { closeMenu(); setDeleteDeck(menuDeck); },
    },
  ] : [];

  return (
    <SidebarLayout
      navigation={navigation}
      sidebarOpen={sidebarOpen}
      onClose={() => setSidebarOpen(false)}
    >
      <View style={{ flex: 1 }}>
        <ScreenContainer>

          {/* Header row */}
          <View style={styles.headerRow}>
            <Text style={styles.title}>Decks</Text>
            {decks.length > 1 && (
              <TouchableOpacity
                style={styles.sortBtn}
                onPress={() => setSortAlpha(v => !v)}
              >
                <Ionicons name="swap-vertical-outline" size={14} color={colors.brand} />
                <Text style={styles.sortBtnText}>{sortAlpha ? 'Recent' : 'A–Z'}</Text>
              </TouchableOpacity>
            )}
          </View>

          {decks.length === 0 ? (
            <EmptyState onPress={() => navigation.navigate('NewDeck')} />
          ) : (
            <FlatList
              data={sortedDecks}
              keyExtractor={item => item.id}
              contentContainerStyle={isPhone ? { paddingBottom: 88 } : undefined}
              renderItem={({ item }) => (
                <View style={styles.deckCard}>
                  <View style={styles.deckAccent} />
                  <TouchableOpacity
                    style={styles.deckInfo}
                    onPress={() => openDeck(item)}
                  >
                    <Text style={styles.deckName} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.deckMeta}>
                      <Text style={styles.deckCount}>{item.cards.length} cards</Text>
                      {item.isNew && (
                        <View style={styles.newBadge}>
                          <Text style={styles.newBadgeText}>New</Text>
                        </View>
                      )}
                      {['bronze', 'silver', 'gold'].some(t => item.trophies?.[t]) && (
                        <View style={styles.trophyMini}>
                          {['bronze', 'silver', 'gold'].map(tier =>
                            item.trophies?.[tier]
                              ? <Ionicons key={tier} name="trophy" size={14} color={TROPHY_COLORS[tier]} />
                              : null
                          )}
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                  <View style={styles.divider} />
                  <TouchableOpacity
                    style={styles.menuBtn}
                    onPress={() => { setMenuDeck(item); setMenuVisible(true); }}
                  >
                    <Text style={styles.menuDots}>•••</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}

          {/* New deck button — desktop only (mobile has sticky footer) */}
          {!isPhone && decks.length > 0 && (
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('NewDeck')}
            >
              <Text style={styles.createButtonText}>+ New deck</Text>
            </TouchableOpacity>
          )}

        </ScreenContainer>

        {/* Sticky footer — mobile only */}
        {isPhone && (
          <View style={styles.stickyFooter}>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('NewDeck')}
            >
              <Text style={styles.createButtonText}>+ New deck</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── Deck action sheet ── */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.menuOverlay}
          onPress={closeMenu}
          activeOpacity={1}
        >
          <View style={styles.menuSheet}>
            <Text style={styles.menuSheetTitle} numberOfLines={1}>
              {menuDeck?.name}
            </Text>
            {menuActions.map(({ label, icon, danger, onPress }) => (
              <TouchableOpacity key={label} style={styles.menuRow} onPress={onPress}>
                <Ionicons
                  name={icon}
                  size={20}
                  color={danger ? colors.danger : colors.textPrimary}
                  style={styles.menuRowIcon}
                />
                <Text style={[styles.menuRowText, danger && styles.menuRowTextDanger]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.menuCancelRow} onPress={closeMenu}>
              <Text style={styles.menuCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Rename modal ── */}
      <Modal visible={renameVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Rename deck</Text>
            <TextInput
              style={styles.modalInput}
              value={renameText}
              onChangeText={setRenameText}
              autoFocus
              onSubmitEditing={confirmRename}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setRenameVisible(false)} style={styles.modalCancel}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmRename} style={styles.modalSave}>
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Delete confirm modal ── */}
      <Modal visible={!!deleteDeck} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Delete deck?</Text>
            <Text style={styles.modalMessage}>
              "{deleteDeck?.name}" will be permanently deleted.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setDeleteDeck(null)} style={styles.modalCancel}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmDelete} style={styles.modalDelete}>
                <Text style={styles.modalDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SidebarLayout>
  );
}

function EmptyState({ onPress }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📚</Text>
      <Text style={styles.emptyHeading}>No decks yet</Text>
      <Text style={styles.emptySubtext}>
        Create your first deck and start learning. You can type cards manually or import a spreadsheet.
      </Text>
      <TouchableOpacity style={styles.emptyBtn} onPress={onPress}>
        <Text style={styles.emptyBtnText}>+ Create your first deck</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  hamburgerBtn: { paddingLeft: 12 },

  // Header row
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.brand,
  },
  sortBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.brand,
  },

  // Deck list
  deckCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    marginBottom: 12,
    overflow: 'hidden',
    ...shadows.sm,
  },
  deckAccent: {
    width: 4,
    alignSelf: 'stretch',
    backgroundColor: colors.brand,
  },
  deckInfo: { flex: 1, padding: 16 },
  deckName: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  deckMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  deckCount: { fontSize: 13, color: colors.textSecondary },
  newBadge: {
    backgroundColor: colors.brand,
    borderRadius: radius.badge,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  newBadgeText: { color: colors.surface, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  trophyMini: { flexDirection: 'row', gap: 3, alignItems: 'center' },
  divider: { width: 1, height: '60%', backgroundColor: colors.border },
  menuBtn: { paddingHorizontal: 14, paddingVertical: 16 },
  menuDots: { fontSize: 14, color: colors.textSecondary, letterSpacing: 2 },

  // New deck button (desktop inline + mobile sticky)
  createButton: {
    backgroundColor: colors.accent,
    padding: 16,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: 20,
    maxWidth: 340,
    alignSelf: 'center',
    width: '100%',
  },
  createButtonText: { color: colors.textPrimary, fontSize: 17, fontWeight: '700' },

  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    maxWidth: 300,
  },
  emptyBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: radius.md,
  },
  emptyBtnText: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },

  // Deck action sheet
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  menuSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingBottom: 32,
    paddingTop: 8,
    ...shadows.overlay,
  },
  menuSheetTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    marginBottom: 4,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  menuRowIcon: { marginRight: 14 },
  menuRowText: { fontSize: 17, color: colors.textPrimary },
  menuRowTextDanger: { color: colors.danger },
  menuCancelRow: {
    marginTop: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  menuCancelText: { fontSize: 17, color: colors.textSecondary, fontWeight: '500' },

  // Rename / delete modals
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
    maxWidth: 360,
  },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8, color: colors.textPrimary },
  modalMessage: { fontSize: 14, color: colors.textSecondary, marginBottom: 20, lineHeight: 20 },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: 10,
    fontSize: 16,
    marginBottom: 16,
    color: colors.textPrimary,
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalCancel: { padding: 8 },
  modalCancelText: { fontSize: 16, color: colors.textSecondary },
  modalSave: { padding: 8 },
  modalSaveText: { fontSize: 16, color: colors.brand, fontWeight: '600' },
  modalDelete: { padding: 8 },
  modalDeleteText: { fontSize: 16, color: colors.danger, fontWeight: '600' },
});
