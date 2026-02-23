import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';

export default function AppHeader({ onHomePress }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onHomePress} activeOpacity={0.8}>
        <Image
          source={require('../assets/Logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <View style={styles.right}>
        {/* Global nav links — future */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 100,
    backgroundColor: '#fcfdfc',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  logo: {
    width: 380,
    height: 88,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
