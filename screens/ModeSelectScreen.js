import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius } from '../constants/theme';

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
    backgroundColor: colors.background,
    padding: 24,
  },
  deckName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  cardCount: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 40,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 16,
    width: '100%',
    maxWidth: 340,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.textPrimary,
    marginBottom: 2,
  },
  optionLabelDisabled: {
    color: colors.textSecondary,
  },
  optionDesc: {
    fontSize: 13,
    color: colors.textMuted,
  },
  chevron: {
    fontSize: 22,
    color: colors.textMuted,
  },
});
