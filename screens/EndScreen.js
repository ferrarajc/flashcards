import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';

export default function EndScreen({ route, navigation }) {
  const { deckName, total } = route.params;

  return (
    <ScreenContainer style={styles.centered}>
      <Text style={styles.emoji}>🎉</Text>
      <Text style={styles.title}>Deck complete!</Text>
      <Text style={styles.subtitle}>You went through all {total} cards in</Text>
      <Text style={styles.deckName}>"{deckName}"</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.buttonText}>Back to decks</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 12 },
  subtitle: { fontSize: 18, color: '#555', textAlign: 'center' },
  deckName: { fontSize: 20, fontWeight: '600', color: '#4a90e2', marginTop: 8, marginBottom: 40 },
  button: {
    backgroundColor: '#4a90e2', paddingHorizontal: 40,
    paddingVertical: 14, borderRadius: 12,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
