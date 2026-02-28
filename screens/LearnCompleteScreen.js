import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LearnCompleteScreen({ route, navigation }) {
  const { deck, didGet, didntGet, hasMissed } = route.params;
  const total = deck.cards.length;

  // Load trophies fresh from storage so we show what was just saved
  const [trophies, setTrophies] = React.useState({});
  useEffect(() => {
    AsyncStorage.getItem('decks').then(stored => {
      if (!stored) return;
      const decks = JSON.parse(stored);
      const d = decks.find(d => d.id === deck.id);
      if (d?.trophies) setTrophies(d.trophies);
    });
  }, []);

  // Animate the 100% label
  const colorAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.timing(colorAnim, { toValue: 1, duration: 800, useNativeDriver: false }),
    ]).start();
  }, []);

  const animatedColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#222222', '#4caf50'],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.emoji}>🎉</Text>

        <Animated.Text style={[styles.pct, { color: animatedColor, transform: [{ scale: scaleAnim }] }]}>
          100%
        </Animated.Text>
        <Text style={styles.label}>You got them all!</Text>
        <Text style={styles.deckName}>{deck.name}</Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{total}</Text>
            <Text style={styles.statLabel}>cards</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: '#4caf50' }]}>{didGet}</Text>
            <Text style={styles.statLabel}>got it</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: '#e05252' }]}>{didntGet}</Text>
            <Text style={styles.statLabel}>missed</Text>
          </View>
        </View>

        {/* Trophies */}
        <View style={styles.trophyRow}>
          <Text style={[styles.trophy, trophies.bronze ? styles.trophyEarned : styles.trophyLocked]}>🥉</Text>
          <Text style={[styles.trophy, trophies.silver ? styles.trophyEarned : styles.trophyLocked]}>🥈</Text>
          <Text style={[styles.trophy, trophies.gold ? styles.trophyEarned : styles.trophyLocked]}>🥇</Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.secondaryText}>My Decks</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.replace('Learn', { deck })}
          >
            <Text style={styles.primaryText}>Run again</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emoji: { fontSize: 64, marginBottom: 16 },
  pct: { fontSize: 72, fontWeight: '800', marginBottom: 8 },
  label: { fontSize: 22, fontWeight: '600', color: '#222', marginBottom: 4 },
  deckName: { fontSize: 15, color: '#888', marginBottom: 28 },
  statsRow: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 28,
  },
  stat: { alignItems: 'center' },
  statNum: { fontSize: 28, fontWeight: '700', color: '#222' },
  statLabel: { fontSize: 12, color: '#aaa', marginTop: 2 },
  trophyRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
  },
  trophy: { fontSize: 40 },
  trophyEarned: { opacity: 1 },
  trophyLocked: { opacity: 0.2 },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    maxWidth: 340,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#4a90e2',
    alignItems: 'center',
  },
  secondaryText: { color: '#4a90e2', fontSize: 16, fontWeight: '600' },
  primaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#4a90e2',
    alignItems: 'center',
  },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
