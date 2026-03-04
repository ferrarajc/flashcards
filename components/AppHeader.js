import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

export default function AppBar({ navigation, back, options }) {
  const LeftComponent = options?.headerLeft;

  return (
    <View style={styles.bar}>

      {/* Left slot: back arrow on inner screens, or injected component (hamburger) on Home */}
      <View style={styles.side}>
        {back ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        ) : LeftComponent ? (
          <LeftComponent tintColor="#fff" />
        ) : null}
      </View>

      {/* Wordmark — always centered, always navigates to Home */}
      <TouchableOpacity onPress={() => navigation.navigate('Home')} activeOpacity={0.75}>
        <Text style={styles.wordmark}>
          Flashy<Text style={styles.wordmarkAccent}>Cards</Text>
        </Text>
      </TouchableOpacity>

      {/* Right slot — reserved for future actions */}
      <View style={styles.side} />

    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 58,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  side: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtn: {
    padding: 8,
  },
  wordmark: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.surface,
    letterSpacing: -0.3,
  },
  wordmarkAccent: {
    color: colors.accent,
  },
});
