import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import Papa from 'papaparse';

const MAX_CONTENT_WIDTH = 680;

export default function CreateDeckScreen({ navigation }) {
  const [deckName, setDeckName] = useState('');
  const [cards, setCards] = useState([{ front: '', back: '' }]);
  const [loading, setLoading] = useState(false);

  const updateCard = (index, field, value) => {
    if (value.length > 1000) return;
    const updated = [...cards];
    updated[index][field] = value;
    setCards(updated);
  };

  const addCard = () => setCards([...cards, { front: '', back: '' }]);

  const removeCard = (index) => {
    if (cards.length === 1) return;
    setCards(cards.filter((_, i) => i !== index));
  };

  const importCSV = async () => {
    try {
      setLoading(true);
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (result.canceled) { setLoading(false); return; }

      const uri = result.assets[0].uri;
      const content = await FileSystem.readAsStringAsync(uri, { encoding: 'utf8' });
      const parsed = Papa.parse(content, { skipEmptyLines: true });
      const imported = parsed.data
        .map(row => ({ front: (row[0] || '').slice(0, 1000), back: (row[1] || '').slice(0, 1000) }))
        .filter(c => c.front || c.back);

      if (imported.length === 0) {
        Alert.alert('No cards found', 'Make sure your CSV has two columns: front and back.');
      } else {
        setCards(imported);
        Alert.alert('Imported!', `${imported.length} cards loaded from CSV.`);
      }
    } catch (e) {
      Alert.alert('Error', `Could not read the file: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const saveDeck = async () => {
    if (!deckName.trim()) { Alert.alert('Name required', 'Please give your deck a name.'); return; }
    const validCards = cards.filter(c => c.front.trim() || c.back.trim());
    if (validCards.length === 0) { Alert.alert('No cards', 'Add at least one card.'); return; }

    try {
      const stored = await AsyncStorage.getItem('decks');
      const decks = stored ? JSON.parse(stored) : [];
      const newDeck = { id: Date.now().toString(), name: deckName.trim(), cards: validCards };
      await AsyncStorage.setItem('decks', JSON.stringify([...decks, newDeck]));
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Could not save deck.');
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.inner}>
        <Text style={styles.label}>Deck Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Spanish Vocabulary"
          value={deckName}
          onChangeText={setDeckName}
        />

        <TouchableOpacity style={styles.csvButton} onPress={importCSV} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.csvButtonText}>Import from CSV</Text>}
        </TouchableOpacity>
        <Text style={styles.csvHint}>CSV format: column 1 = front, column 2 = back</Text>

        <Text style={styles.label}>Cards</Text>
        {cards.map((card, index) => (
          <View key={index} style={styles.cardRow}>
            <View style={styles.cardInputs}>
              <TextInput
                style={styles.cardInput}
                placeholder="Front (question)"
                value={card.front}
                onChangeText={v => updateCard(index, 'front', v)}
                multiline
                maxLength={1000}
              />
              <TextInput
                style={styles.cardInput}
                placeholder="Back (answer)"
                value={card.back}
                onChangeText={v => updateCard(index, 'back', v)}
                multiline
                maxLength={1000}
              />
            </View>
            <TouchableOpacity onPress={() => removeCard(index)} style={styles.removeBtn}>
              <Text style={styles.removeText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addCardBtn} onPress={addCard}>
          <Text style={styles.addCardText}>+ Add Card</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={saveDeck}>
          <Text style={styles.saveButtonText}>Save deck</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#f5f5f5' },
  contentContainer: { alignItems: 'center' },
  inner: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, padding: 20 },
  label: { fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 6 },
  input: {
    backgroundColor: '#fff', borderRadius: 8, padding: 12,
    fontSize: 16, borderWidth: 1, borderColor: '#ddd',
  },
  csvButton: {
    backgroundColor: '#5a9e6f', padding: 12, borderRadius: 8,
    alignItems: 'center', marginTop: 16,
    maxWidth: 340, alignSelf: 'center', width: '100%',
  },
  csvButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  csvHint: { color: '#999', fontSize: 12, marginTop: 4, marginBottom: 8 },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  cardInputs: { flex: 1 },
  cardInput: {
    backgroundColor: '#fff', borderRadius: 8, padding: 10,
    fontSize: 14, borderWidth: 1, borderColor: '#ddd', marginBottom: 6,
  },
  removeBtn: { marginLeft: 8, paddingTop: 10 },
  removeText: { fontSize: 18, color: '#cc3333' },
  addCardBtn: {
    borderWidth: 1, borderColor: '#4a90e2', borderRadius: 8,
    padding: 10, alignItems: 'center', marginBottom: 16,
    maxWidth: 340, alignSelf: 'center', width: '100%',
  },
  addCardText: { color: '#4a90e2', fontSize: 15, fontWeight: '600' },
  saveButton: {
    backgroundColor: '#4a90e2', padding: 16, borderRadius: 12, alignItems: 'center',
    maxWidth: 340, alignSelf: 'center', width: '100%',
  },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
