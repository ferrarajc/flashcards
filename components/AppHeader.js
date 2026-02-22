import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useBreakpoint } from '../hooks/useBreakpoint';

export default function AppHeader({ navigation, onHamburgerPress }) {
  const { isPhone } = useBreakpoint();

  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.navigate('Home')}
        activeOpacity={0.8}
      >
        <Image
          source={require('../assets/Logo.png')}
          style={[styles.logo, isPhone && styles.logoPhone]}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <View style={styles.right}>
        {isPhone && onHamburgerPress && (
          <TouchableOpacity onPress={onHamburgerPress} style={styles.hamburger}>
            <View style={styles.bar} />
            <View style={styles.bar} />
            <View style={styles.bar} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 64,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  logo: {
    width: 160,
    height: 44,
  },
  logoPhone: {
    width: 130,
    height: 36,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hamburger: {
    padding: 8,
    gap: 5,
  },
  bar: {
    width: 22,
    height: 2,
    backgroundColor: '#333',
    borderRadius: 2,
  },
});
