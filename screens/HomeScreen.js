import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActionSheetIOS, TextInput, Modal
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import SidebarLayout from '../components/SidebarLayout';
import ScreenContainer from '../components/ScreenContainer';
import { useBreakpoint } from '../hooks/useBreakpoint';

const TROPHY_COLORS = { bronze: '#cd7f32', silver: '#a8a9ad', gold: '#ffd700' };
const BRAND  = '#4F46E5';
const ACCENT = '#F59E0B';

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

export default function HomeScreen({ navigation }) {
  const [decks, setDecks] = useState([]);
  const [renameVisible, setRenameVisible] = useState(false);
  const [renameDeckId, setRenameDeckId] = useState(null);
  const [renameText, setRenameText] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isPhone } = useBreakpoint();

  const loadDecks = async () => {
    try {
      const stored = await AsyncStorage.getItem('decks');
      if (!stored) return;
      const parsed = JSON.parse(stored);
      const now = Date.now();

      // Auto-expire New badge after 7 days
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
          <Ionicons name="menu" size={26} color="#fff" />
        </TouchableOpacity>
      ) : () => null,
    });
  }, [isPhone, navigation]);

  const saveDecks = async (updated) => {
    setDecks(updated);
    await AsyncStorage.setItem('decks', JSON.stringify(updated));
  };

  const clearNewBadge = (deck) => {
    if (!deck.isNew) return;
    const updated = decks.map(d => d.id === deck.id ? { ...d, isNew: false } : d);
    saveDecks(updated);
  };

  const deleteDeck = (deck) => {
    Alert.alert(
      `Delete "${deck.name}"`,
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            await saveDecks(decks.filter(d => d.id !== deck.id));
          }
        }
      ]
    );
  };

  const startRename = (deck) => {
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

  const showMenu = (deck) => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: deck.name,
        options: ['Cancel', 'Learn', 'Rename', 'Edit', 'Delete'],
        cancelButtonIndex: 0,
        destructiveButtonIndex: 4,
      },
      (index) => {
        if (index === 1) { clearNewBadge(deck); navigation.navigate('ModeSelect', { deck }); }
        if (index === 2) startRename(deck);
        if (index === 3) navigation.navigate('EditDeck', { deck });
        if (index === 4) deleteDeck(deck);
      }
    );
  };

  return (
    <SidebarLayout
      navigation={navigation}
      sidebarOpen={sidebarOpen}
      onClose={() => setSidebarOpen(false)}
    >
      <ScreenContainer>
        <Text style={styles.title}>My decks</Text>

        {decks.length === 0 ? (
          <Text style={styles.empty}>No decks yet. Create one!</Text>
        ) : (
          <FlatList
            data={decks}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.deckCard}>
                {/* Accent strip */}
                <View style={styles.deckAccent} />
                <TouchableOpacity
                  style={styles.deckInfo}
                  onPress={() => { clearNewBadge(item); navigation.navigate('ModeSelect', { deck: item }); }}
                >
                  <Text style={styles.deckName} numberOfLines={1}>{item.name}</Text>
                  <View style={styles.deckMeta}>
                    <Text style={styles.deckCount}>{item.cards.length} cards</Text>
                    {item.isNew && (
                      <View style={styles.newBadge}>
                        <Text style={styles.newBadgeText}>New</Text>
                      </View>
                    )}
                    {/* Earned trophies */}
                    {['bronze', 'silver', 'gold'].some(t => item.trophies?.[t]) && (
                      <View style={styles.trophyMini}>
                        {['bronze', 'silver', 'gold'].map(tier =>
                          item.trophies?.[tier] ? (
                            <Ionicons key={tier} name="trophy" size={14} color={TROPHY_COLORS[tier]} />
                          ) : null
                        )}
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.menuBtn} onPress={() => showMenu(item)}>
                  <Text style={styles.menuDots}>•••</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}

        {/* Rename modal */}
        <Modal visible={renameVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Rename deck</Text>
              <TextInput
                style={styles.modalInput}
                value={renameText}
                onChangeText={setRenameText}
                autoFocus
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

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('NewDeck')}
        >
          <Text style={styles.createButtonText}>+ New deck</Text>
        </TouchableOpacity>
      </ScreenContainer>
    </SidebarLayout>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800', color: '#1E1B4B', marginBottom: 20, marginTop: 10, textAlign: 'center' },
  empty: { color: '#999', fontSize: 16, textAlign: 'center', marginTop: 60 },
  deckCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  deckAccent: {
    width: 4,
    alignSelf: 'stretch',
    backgroundColor: BRAND,
  },
  deckInfo: { flex: 1, padding: 16 },
  deckName: { fontSize: 17, fontWeight: '700', color: '#1E1B4B' },
  deckMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  deckCount: { fontSize: 13, color: '#888' },
  newBadge: {
    backgroundColor: BRAND, borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  newBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  trophyMini: { flexDirection: 'row', gap: 3, alignItems: 'center' },
  divider: { width: 1, height: '60%', backgroundColor: '#e0e0e0' },
  menuBtn: { paddingHorizontal: 10, paddingVertical: 16 },
  menuDots: { fontSize: 14, color: '#555', letterSpacing: 2 },
  createButton: {
    backgroundColor: ACCENT,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    maxWidth: 340,
    alignSelf: 'center',
    width: '100%',
  },
  createButtonText: { color: '#1E1B4B', fontSize: 17, fontWeight: '700' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  modalBox: { backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '80%' },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  modalInput: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    padding: 10, fontSize: 16, marginBottom: 16,
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalCancel: { padding: 8 },
  modalCancelText: { fontSize: 16, color: '#888' },
  modalSave: { padding: 8 },
  modalSaveText: { fontSize: 16, color: BRAND, fontWeight: '600' },
  hamburgerBtn: { paddingLeft: 12 },
});
