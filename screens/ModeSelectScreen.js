import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ModeSelectScreen({ route, navigation }) {
  const { deck } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.deckName}>{deck.name}</Text>
      <Text style={styles.cardCount}>{deck.cards.length} cards</Text>

      <TouchableOpacity
        style={styles.option}
        onPress={() => navigation.navigate('Learn', { deck })}
      >
        <Text style={styles.optionIcon}>📖</Text>
        <View style={styles.optionText}>
          <Text style={styles.optionLabel}>Learn</Text>
          <Text style={styles.optionDesc}>Go through cards at your own pace</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.option, styles.optionDisabled]} disabled>
        <Text style={styles.optionIcon}>📝</Text>
        <View style={styles.optionText}>
          <Text style={[styles.optionLabel, styles.optionLabelDisabled]}>Test</Text>
          <Text style={styles.optionDesc}>Coming soon</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: 24,
  },
  deckName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardCount: {
    fontSize: 14,
    color: '#888',
    marginBottom: 40,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    maxWidth: 340,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  optionDisabled: {
    opacity: 0.45,
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 14,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
    marginBottom: 2,
  },
  optionLabelDisabled: {
    color: '#888',
  },
  optionDesc: {
    fontSize: 13,
    color: '#aaa',
  },
  chevron: {
    fontSize: 22,
    color: '#aaa',
  },
});
