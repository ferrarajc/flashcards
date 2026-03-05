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

      <TouchableOpacity style={styles.item} onPress={() => navigate('Home')}>
        <Ionicons name="albums-outline" size={18} color={colors.brand} style={styles.itemIcon} />
        <Text style={styles.itemText}>My decks</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => navigate('NewDeck')}>
        <Ionicons name="add-circle-outline" size={18} color={colors.brand} style={styles.itemIcon} />
        <Text style={styles.itemText}>New deck</Text>
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
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
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
});
