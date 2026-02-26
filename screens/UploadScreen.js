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
      <Text style={styles.sub}>Supports .csv, .xls, and tab-delimited files.{'\n'}First column = front, second column = back.</Text>

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
    marginBottom: 24,
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
