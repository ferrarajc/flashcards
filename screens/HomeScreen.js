import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation }) {
  const [decks, setDecks] = useState([]);

  const loadDecks = async () => {
    try {
      const stored = await AsyncStorage.getItem('decks');
      if (stored) setDecks(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }
  };

  useFocusEffect(useCallback(() => { loadDecks(); }, []));

  const deleteDeck = (id) => {
    Alert.alert('Delete Deck', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          const updated = decks.filter(d => d.id !== id);
          setDecks(updated);
          await AsyncStorage.setItem('decks', JSON.stringify(updated));
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Flashcard Decks</Text>

      {decks.length === 0 ? (
        <Text style={styles.empty}>No decks yet. Create one!</Text>
      ) : (
        <FlatList
          data={decks}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.deckRow}>
              <TouchableOpacity
                style={styles.deckButton}
                onPress={() => navigation.navigate('Quiz', { deck: item })}
              >
                <Text style={styles.deckName}>{item.name}</Text>
                <Text style={styles.deckCount}>{item.cards.length} cards</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteDeck(item.id)} style={styles.deleteBtn}>
                <Text style={styles.deleteText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateDeck')}
      >
        <Text style={styles.createButtonText}>+ New Deck</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, marginTop: 10 },
  empty: { color: '#999', fontSize: 16, textAlign: 'center', marginTop: 60 },
  deckRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  deckButton: {
    flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 10,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  deckName: { fontSize: 18, fontWeight: '600' },
  deckCount: { fontSize: 13, color: '#888', marginTop: 4 },
  deleteBtn: { marginLeft: 10, padding: 8 },
  deleteText: { fontSize: 18, color: '#cc3333' },
  createButton: {
    backgroundColor: '#4a90e2', padding: 16, borderRadius: 12,
    alignItems: 'center', marginTop: 20,
  },
  createButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
