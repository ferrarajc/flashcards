import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Sidebar from './Sidebar';
import { useBreakpoint } from '../hooks/useBreakpoint';

export default function SidebarLayout({ children, navigation, sidebarOpen, onClose }) {
  const { isPhone } = useBreakpoint();

  if (!isPhone) {
    // Tablet/desktop: permanent sidebar on the left
    return (
      <View style={styles.row}>
        <View style={styles.permanentSidebar}>
          <Sidebar navigation={navigation} />
        </View>
        <View style={styles.content}>{children}</View>
      </View>
    );
  }

  // Phone: full-screen content, sidebar overlays when open
  return (
    <View style={{ flex: 1 }}>
      {children}
      {sidebarOpen && (
        <>
          <TouchableOpacity
            style={styles.overlay}
            onPress={onClose}
            activeOpacity={1}
          />
          <View style={styles.mobileSidebar}>
            <Sidebar navigation={navigation} onClose={onClose} />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  permanentSidebar: {
    width: 240,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  content: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  mobileSidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 260,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
});
