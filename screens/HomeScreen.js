import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Modal,
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

  const [menuDeck, setMenuDeck] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const [renameVisible, setRenameVisible] = useState(false);
  const [renameDeckId, setRenameDeckId] = useState(null);
  const [renameText, setRenameText] = useState('');

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
              <View style={styles.segControl}>
                <TouchableOpacity
                  style={[styles.segBtn, !sortAlpha && styles.segBtnActive]}
                  onPress={() => setSortAlpha(false)}
                >
                  <Text style={[styles.segBtnText, !sortAlpha && styles.segBtnTextActive]}>
                    Recent
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.segBtn, sortAlpha && styles.segBtnActive]}
                  onPress={() => setSortAlpha(true)}
                >
                  <Text style={[styles.segBtnText, sortAlpha && styles.segBtnTextActive]}>
                    A–Z
                  </Text>
                </TouchableOpacity>
              </View>
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
                  <TouchableOpacity style={styles.deckInfo} onPress={() => openDeck(item)}>
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

          {!isPhone && decks.length > 0 && (
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('NewDeck')}
            >
              <Text style={styles.createButtonText}>+ New deck</Text>
            </TouchableOpacity>
          )}

        </ScreenContainer>

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

      {/* ── Deck action menu ── */}
      <Modal visible={menuVisible} transparent animationType="fade">
        {isPhone ? (
          // Mobile: compact bottom sheet
          <TouchableOpacity style={styles.sheetOverlay} onPress={closeMenu} activeOpacity={1}>
            <View style={styles.sheet}>
              <Text style={styles.sheetTitle} numberOfLines={1}>{menuDeck?.name}</Text>
              {menuActions.map(({ label, icon, danger, onPress }) => (
                <TouchableOpacity key={label} style={styles.sheetRow} onPress={onPress}>
                  <Ionicons
                    name={icon}
                    size={18}
                    color={danger ? colors.danger : colors.textPrimary}
                    style={styles.sheetRowIcon}
                  />
                  <Text style={[styles.sheetRowText, danger && styles.sheetRowTextDanger]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.sheetCancel} onPress={closeMenu}>
                <Text style={styles.sheetCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ) : (
          // Desktop: small centered popup
          <TouchableOpacity style={styles.popupOverlay} onPress={closeMenu} activeOpacity={1}>
            <View style={styles.popup}>
              <Text style={styles.popupTitle} numberOfLines={1}>{menuDeck?.name}</Text>
              {menuActions.map(({ label, icon, danger, onPress }) => (
                <TouchableOpacity key={label} style={styles.popupRow} onPress={onPress}>
                  <Ionicons
                    name={icon}
                    size={16}
                    color={danger ? colors.danger : colors.textPrimary}
                    style={styles.popupRowIcon}
                  />
                  <Text style={[styles.popupRowText, danger && styles.popupRowTextDanger]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        )}
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
              <TouchableOpacity onPress={confirmDelete} style={styles.modalSave}>
                <Text style={[styles.modalSaveText, { color: colors.danger }]}>Delete</Text>
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

  // Segmented sort control
  segControl: {
    flexDirection: 'row',
    backgroundColor: colors.borderLight,
    borderRadius: radius.pill,
    padding: 3,
  },
  segBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  segBtnActive: {
    backgroundColor: colors.brand,
  },
  segBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  segBtnTextActive: {
    color: colors.surface,
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

  // New deck button
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

  // Mobile bottom sheet
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingBottom: 24,
    paddingTop: 4,
  },
  sheetTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    marginBottom: 2,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sheetRowIcon: { marginRight: 12 },
  sheetRowText: { fontSize: 15, color: colors.textPrimary },
  sheetRowTextDanger: { color: colors.danger },
  sheetCancel: {
    marginTop: 6,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  sheetCancelText: { fontSize: 15, color: colors.textSecondary },

  // Desktop popup menu
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popup: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    width: 200,
    paddingVertical: 6,
    ...shadows.lg,
  },
  popupTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  popupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  popupRowIcon: { marginRight: 10 },
  popupRowText: { fontSize: 14, color: colors.textPrimary },
  popupRowTextDanger: { color: colors.danger },

  // Shared modals
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
});
