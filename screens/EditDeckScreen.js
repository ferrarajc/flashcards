import React from 'react';
import { Text, StyleSheet } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';

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
  title: { fontSize: 22, fontWeight: '600', marginBottom: 12 },
  subtitle: { fontSize: 16, color: '#999' },
});
