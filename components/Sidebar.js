import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../constants/theme';

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
          <Ionicons name="albums-outline" size={18} color={colors.brand} style={styles.itemIcon} />
          <Text style={styles.itemText}>My decks</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <TouchableOpacity style={styles.newDeckBtn} onPress={() => navigate('NewDeck')}>
        <Ionicons name="add-circle-outline" size={18} color={colors.brand} style={styles.itemIcon} />
        <Text style={styles.newDeckText}>New deck</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingTop: 20,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1.2,
    marginBottom: 6,
    paddingHorizontal: 6,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: radius.sm,
  },
  itemIcon: {
    marginRight: 10,
  },
  itemText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  newDeckBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: radius.sm,
  },
  newDeckText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.brand,
  },
});
