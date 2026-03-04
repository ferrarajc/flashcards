import React from 'react';
import { Text, StyleSheet } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import { colors } from '../constants/theme';

export default function EditDeckScreen({ route }) {
  const { deck } = route.params;

  return (
    <ScreenContainer style={styles.centered}>
      <Text style={styles.title}>Edit "{deck.name}"</Text>
      <Text style={styles.subtitle}>Coming soon</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: { alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '600', color: colors.textPrimary, marginBottom: 12 },
  subtitle: { fontSize: 16, color: colors.textSecondary },
});
