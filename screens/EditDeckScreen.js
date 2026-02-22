import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function EditDeckScreen({ route }) {
  const { deck } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit "{deck.name}"</Text>
      <Text style={styles.subtitle}>Coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 12 },
  subtitle: { fontSize: 16, color: '#999' },
});
