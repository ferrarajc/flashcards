import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import Papa from 'papaparse';

async function readFileAsString(uri) {
  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    return response.text();
  }
  return FileSystem.readAsStringAsync(uri, { encoding: 'utf8' });
}

const SPREADSHEET_TYPES = [
  'text/csv',
  'text/tab-separated-values',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

function deriveNameFromFilename(filename) {
  return filename.replace(/\.[^/.]+$/, '').trim();
}

export default function UploadScreen({ navigation }) {
  const [loading, setLoading] = useState(false);

  const pickAndImport = async () => {
    try {
      setLoading(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: SPREADSHEET_TYPES,
        copyToCacheDirectory: true,
      });
      if (result.canceled) { setLoading(false); return; }

      const asset = result.assets[0];
      const content = await readFileAsString(asset.uri);
      const parsed = Papa.parse(content, { skipEmptyLines: true });
      const cards = parsed.data
        .map(row => ({ front: (row[0] || '').slice(0, 1000), back: (row[1] || '').slice(0, 1000) }))
        .filter(c => c.front || c.back);

      if (cards.length === 0) {
        Alert.alert('No cards found', 'Make sure your file has two columns: front and back.');
        setLoading(false);
        return;
      }

      const name = deriveNameFromFilename(asset.name);
      const newDeck = { id: Date.now().toString(), name, cards, isNew: true, createdAt: Date.now() };
      const stored = await AsyncStorage.getItem('decks');
      const decks = stored ? JSON.parse(stored) : [];
      await AsyncStorage.setItem('decks', JSON.stringify([...decks, newDeck]));

      navigation.navigate('Home');
    } catch (e) {
      Alert.alert('Error', `Could not import file: ${e.message}`);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Upload a spreadsheet</Text>
      <Text style={styles.sub}>Supports .csv, .xls, .tsv, etc.</Text>
      <Text style={[styles.sub, { marginBottom: 24 }]}>
        {'First column = Front of card\nSecond column = Back of card'}
      </Text>

      <TouchableOpacity style={styles.button} onPress={pickAndImport} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Choose file</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
  },
  sub: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
