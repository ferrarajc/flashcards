import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, SafeAreaView, ScrollView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';


const TROPHY_COLORS = { bronze: '#cd7f32', silver: '#a8a9ad', gold: '#ffd700' };
const TROPHY_NAMES  = { bronze: 'Bronze',  silver: 'Silver',  gold: 'Gold'   };

const CONFETTI_COLORS = [
  '#e05252', '#4caf50', '#4a90e2', '#ffd700',
  '#ff69b4', '#5b6cdb', '#ff9800', '#00bcd4',
];
const CONFETTI_COUNT = 32;

function ConfettiBurst() {
  const pieces = useRef(
    Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
      anim: new Animated.Value(0),
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      // Percentage-based left: spread across the middle 50% of whatever
      // width the container happens to be, so it stays centered on all screens
      leftPct: `${25 + (i * 47 + 10) % 50}%`,
      driftX: ((i * 53 + 20) % 100) - 50,
      size: 5 + (i % 7),
      rotEnd: (i * 73 + 100) % 540 + 180,
      delay: Math.floor(i / 4) * 55,
      duration: 1100 + (i % 5) * 180,
    }))
  ).current;

  useEffect(() => {
    Animated.parallel(
      pieces.map(p =>
        Animated.timing(p.anim, {
          toValue: 1,
          duration: p.duration,
          delay: p.delay,
          useNativeDriver: true,
        })
      )
    ).start();
  }, []);

  return (
    <View pointerEvents="none" style={styles.confettiContainer}>
      {pieces.map((p, i) => {
        const translateY = p.anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 600] });
        const translateX = p.anim.interpolate({ inputRange: [0, 1], outputRange: [0, p.driftX] });
        const rotate    = p.anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.rotEnd}deg`] });
        const opacity   = p.anim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: p.leftPct,
              top: 0,
              width: p.size,
              height: Math.round(p.size * 1.6),
              backgroundColor: p.color,
              borderRadius: 2,
              transform: [{ translateY }, { translateX }, { rotate }],
              opacity,
            }}
          />
        );
      })}
    </View>
  );
}

export default function LearnCompleteScreen({ route, navigation }) {
  const { deck, newTrophy, cardStats = {} } = route.params;

  // Cards missed at least once, sorted by miss count — used for download only
  const studyCards = deck.cards
    .map((card, i) => ({ ...card, missCount: cardStats[String(i)] || 0 }))
    .filter(c => c.missCount > 0)
    .sort((a, b) => b.missCount - a.missCount);

  const downloadCSV = () => {
    if (Platform.OS !== 'web' || !studyCards.length) return;
    const escape = v => `"${String(v).replace(/"/g, '""')}"`;
    const lines = [
      'Question,Answer,Times Missed',
      ...studyCards.map(c => `${escape(c.front)},${escape(c.back)},${c.missCount}`),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `${deck.name}-study-guide.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const scaleAnim = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <ConfettiBurst />

        <Text style={styles.emoji}>🎉</Text>
        <Animated.Text style={[styles.finished, { transform: [{ scale: scaleAnim }] }]}>
          Finished!
        </Animated.Text>
        <Text style={styles.deckName}>{deck.name}</Text>

        {/* Trophy celebration — only when a new trophy was earned this run */}
        {newTrophy && (
          <View style={styles.trophyEarnedRow}>
            <Ionicons
              name="trophy"
              size={80}
              color={TROPHY_COLORS[newTrophy]}
              style={styles.trophyIcon}
            />
            <View style={styles.trophyEarnedMsg}>
              <Text style={styles.trophyEarnedLine1}>You earned a</Text>
              <Text style={[styles.trophyEarnedLine2, { color: TROPHY_COLORS[newTrophy] }]}>
                {TROPHY_NAMES[newTrophy]} Trophy!
              </Text>
            </View>
          </View>
        )}

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

        {/* Study guide — header + download only, no inline table */}
        {studyCards.length > 0 && (
          <View style={styles.studyGuide}>
            <View style={styles.studyHeader}>
              <View>
                <Text style={styles.studyTitle}>Study Guide</Text>
                <Text style={styles.studySubtitle}>
                  Cards at the top need the most reinforcement.
                </Text>
              </View>
              {Platform.OS === 'web' && (
                <TouchableOpacity style={styles.downloadBtn} onPress={downloadCSV}>
                  <Ionicons name="download-outline" size={18} color="#4a90e2" />
                  <Text style={styles.downloadText}>Download</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 60,
    minHeight: '100%',
    justifyContent: 'center',
  },

  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 620,
  },

  emoji: { fontSize: 72, marginBottom: 16 },
  finished: {
    fontSize: 56,
    fontWeight: '800',
    color: '#4caf50',
    marginBottom: 8,
  },
  deckName: { fontSize: 15, color: '#aaa', marginBottom: 40 },

  // Trophy earned card
  trophyEarnedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    paddingRight: 28,
    marginBottom: 40,
    width: '100%',
    maxWidth: 420,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  trophyIcon: { marginRight: 20 },
  trophyEarnedMsg: { flex: 1 },
  trophyEarnedLine1: { fontSize: 16, color: '#888', marginBottom: 2 },
  trophyEarnedLine2: { fontSize: 26, fontWeight: '800', lineHeight: 30 },

  // Buttons
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    maxWidth: 420,
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

  // Study guide header
  studyGuide: {
    width: '100%',
    maxWidth: 420,
    marginTop: 32,
  },
  studyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  studyTitle: { fontSize: 20, fontWeight: '700', color: '#222', marginBottom: 3 },
  studySubtitle: { fontSize: 13, color: '#aaa' },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 3 },
  downloadText: { fontSize: 14, color: '#4a90e2', fontWeight: '600' },
});
