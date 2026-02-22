import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useBreakpoint } from '../hooks/useBreakpoint';

const MAX_CONTENT_WIDTH = 680;

export default function ScreenContainer({ children, style }) {
  const { isPhone } = useBreakpoint();

  return (
    <View style={styles.outer}>
      <View style={[styles.inner, isPhone && styles.innerPhone, style]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  inner: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    padding: 20,
  },
  innerPhone: {
    maxWidth: '100%',
  },
});
