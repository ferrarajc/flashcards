import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

const SPREADSHEET_TYPES = [
  'text/csv',
  'text/tab-separated-values',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export default function UploadScreen() {
  const [fileName, setFileName] = useState(null);
  const [flipped, setFlipped] = useState(false);

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: SPREADSHEET_TYPES,
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    setFileName(result.assets[0].name);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Upload a spreadsheet</Text>
      <Text style={styles.sub}>Supports .csv, .xls, .tsv, etc.</Text>

      <View style={styles.toggle}>
        <TouchableOpacity
          style={[styles.toggleOption, !flipped && styles.toggleOptionActive]}
          onPress={() => setFlipped(false)}
        >
          <Text style={[styles.toggleText, !flipped && styles.toggleTextActive]}>
            Front, Back
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleOption, flipped && styles.toggleOptionActive]}
          onPress={() => setFlipped(true)}
        >
          <Text style={[styles.toggleText, flipped && styles.toggleTextActive]}>
            Back, Front
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sub, { marginBottom: 24 }]}>
        {flipped
          ? 'First column = Back of card\nSecond column = Front of card'
          : 'First column = Front of card\nSecond column = Back of card'}
      </Text>

      <TouchableOpacity style={styles.button} onPress={pickFile}>
        <Text style={styles.buttonText}>Choose file</Text>
      </TouchableOpacity>

      {fileName && <Text style={styles.fileName}>{fileName}</Text>}
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
  toggle: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4a90e2',
    overflow: 'hidden',
    marginBottom: 12,
  },
  toggleOption: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  toggleOptionActive: {
    backgroundColor: '#4a90e2',
  },
  toggleText: {
    fontSize: 14,
    color: '#4a90e2',
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fileName: {
    marginTop: 16,
    fontSize: 14,
    color: '#555',
  },
});
