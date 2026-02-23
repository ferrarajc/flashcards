import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';

export default function Sidebar({ navigation }) {
  return (
    <DrawerContentScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.itemText}>My decks</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity
        style={styles.newDeckItem}
        onPress={() => navigation.getParent()?.navigate('CreateDeck')}
      >
        <Text style={styles.newDeckText}>+ New deck</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  item: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  itemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 20,
    marginVertical: 8,
  },
  newDeckItem: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  newDeckText: {
    fontSize: 16,
    color: '#4a90e2',
    fontWeight: '600',
  },
});
