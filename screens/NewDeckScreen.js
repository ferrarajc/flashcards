import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius } from '../constants/theme';

export default function NewDeckScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>New deck</Text>
      <Text style={styles.sub}>How do you want to add cards?</Text>

      <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('ManualCreate')}>
        <Text style={styles.optionIcon}>✏️</Text>
        <Text style={styles.optionLabel}>Type it in</Text>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('Upload')}>
        <Text style={styles.optionIcon}>📄</Text>
        <Text style={styles.optionLabel}>Upload a file</Text>
        <Text style={styles.chevron}>›</Text>
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
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  sub: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 32,
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
  optionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  chevron: {
    fontSize: 22,
    color: colors.textMuted,
  },
});
