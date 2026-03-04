import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BRAND = '#4F46E5';

export default function Sidebar({ navigation, onClose }) {
  const navigate = (screen, params) => {
    onClose?.();
    navigation.navigate(screen, params);
  };

  return (
    <View style={styles.container}>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>MY DECKS</Text>
        <TouchableOpacity style={styles.item} onPress={() => navigate('Home')}>
          <Ionicons name="albums-outline" size={18} color={BRAND} style={styles.itemIcon} />
          <Text style={styles.itemText}>My decks</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <TouchableOpacity style={styles.newDeckBtn} onPress={() => navigate('NewDeck')}>
        <Ionicons name="add-circle-outline" size={18} color={BRAND} style={styles.itemIcon} />
        <Text style={styles.newDeckText}>New deck</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#aaa',
    letterSpacing: 1.2,
    marginBottom: 6,
    paddingHorizontal: 6,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
  },
  itemIcon: {
    marginRight: 10,
  },
  itemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E1B4B',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  newDeckBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
  },
  newDeckText: {
    fontSize: 15,
    fontWeight: '600',
    color: BRAND,
  },
});
