import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ImportScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Import a spreadsheet</Text>
      <Text style={styles.sub}>File picker coming soon.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
  },
  sub: {
    fontSize: 15,
    color: '#888',
  },
});
