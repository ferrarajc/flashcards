import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import Papa from 'papaparse';
import UploadScreen from '../screens/UploadScreen';

jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn() }));
jest.mock('expo-file-system/legacy', () => ({ readAsStringAsync: jest.fn() }));
jest.mock('papaparse', () => ({ parse: jest.fn() }));
jest.spyOn(Alert, 'alert');

const SPREADSHEET_TYPES = [
  'text/csv',
  'text/tab-separated-values',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

function makeNavigation() {
  return { navigate: jest.fn() };
}

function mockSuccessfulPick(filename = 'test.csv') {
  DocumentPicker.getDocumentAsync.mockResolvedValue({
    canceled: false,
    assets: [{ uri: 'file://test.csv', name: filename }],
  });
}

function mockParsedCards(rows) {
  FileSystem.readAsStringAsync.mockResolvedValue('mocked-content');
  Papa.parse.mockReturnValue({ data: rows });
}

beforeEach(() => {
  jest.clearAllMocks();
  AsyncStorage.clear();
});

describe('UploadScreen', () => {
  describe('rendering', () => {
    it('shows the heading', () => {
      const { getByText } = render(<UploadScreen navigation={makeNavigation()} />);
      expect(getByText('Upload a spreadsheet')).toBeTruthy();
    });

    it('shows supported file types hint', () => {
      const { getByText } = render(<UploadScreen navigation={makeNavigation()} />);
      expect(getByText('Supports .csv, .xls, .tsv, etc.')).toBeTruthy();
    });

    it('shows the Choose file button', () => {
      const { getByText } = render(<UploadScreen navigation={makeNavigation()} />);
      expect(getByText('Choose file')).toBeTruthy();
    });
  });

  describe('file picker', () => {
    it('calls DocumentPicker with spreadsheet MIME types', async () => {
      DocumentPicker.getDocumentAsync.mockResolvedValue({ canceled: true });
      const { getByText } = render(<UploadScreen navigation={makeNavigation()} />);
      fireEvent.press(getByText('Choose file'));
      await waitFor(() => {
        expect(DocumentPicker.getDocumentAsync).toHaveBeenCalledWith({
          type: SPREADSHEET_TYPES,
          copyToCacheDirectory: true,
        });
      });
    });

    it('does nothing when picker is canceled', async () => {
      DocumentPicker.getDocumentAsync.mockResolvedValue({ canceled: true });
      const navigation = makeNavigation();
      const { getByText } = render(<UploadScreen navigation={navigation} />);
      fireEvent.press(getByText('Choose file'));
      await waitFor(() => {
        expect(navigation.navigate).not.toHaveBeenCalled();
      });
    });
  });

  describe('successful import', () => {
    it('navigates to Home after successful import', async () => {
      const navigation = makeNavigation();
      mockSuccessfulPick('european-capitals.csv');
      mockParsedCards([['Albania', 'Tirana'], ['France', 'Paris']]);

      const { getByText } = render(<UploadScreen navigation={navigation} />);
      fireEvent.press(getByText('Choose file'));

      await waitFor(() => {
        expect(navigation.navigate).toHaveBeenCalledWith('Home');
      });
    });

    it('saves deck with isNew: true', async () => {
      mockSuccessfulPick('capitals.csv');
      mockParsedCards([['Germany', 'Berlin']]);

      const { getByText } = render(<UploadScreen navigation={makeNavigation()} />);
      fireEvent.press(getByText('Choose file'));

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalled();
        const saved = JSON.parse(AsyncStorage.setItem.mock.calls[0][1]);
        expect(saved[0].isNew).toBe(true);
      });
    });

    it('derives deck name from filename (strips extension)', async () => {
      mockSuccessfulPick('european-capitals.csv');
      mockParsedCards([['Spain', 'Madrid']]);

      const { getByText } = render(<UploadScreen navigation={makeNavigation()} />);
      fireEvent.press(getByText('Choose file'));

      await waitFor(() => {
        const saved = JSON.parse(AsyncStorage.setItem.mock.calls[0][1]);
        expect(saved[0].name).toBe('european-capitals');
      });
    });

    it('maps column 1 to front and column 2 to back', async () => {
      mockSuccessfulPick('test.csv');
      mockParsedCards([['Question', 'Answer']]);

      const { getByText } = render(<UploadScreen navigation={makeNavigation()} />);
      fireEvent.press(getByText('Choose file'));

      await waitFor(() => {
        const saved = JSON.parse(AsyncStorage.setItem.mock.calls[0][1]);
        expect(saved[0].cards[0]).toEqual({ front: 'Question', back: 'Answer' });
      });
    });
  });

  describe('error cases', () => {
    it('shows alert when file has no valid rows', async () => {
      mockSuccessfulPick('empty.csv');
      mockParsedCards([]);

      const { getByText } = render(<UploadScreen navigation={makeNavigation()} />);
      fireEvent.press(getByText('Choose file'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'No cards found',
          'Make sure your file has two columns: front and back.'
        );
      });
    });

    it('shows alert when file read throws', async () => {
      mockSuccessfulPick('bad.csv');
      FileSystem.readAsStringAsync.mockRejectedValue(new Error('read failed'));

      const { getByText } = render(<UploadScreen navigation={makeNavigation()} />);
      fireEvent.press(getByText('Choose file'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Could not import file: read failed');
      });
    });

    it('does not navigate on error', async () => {
      const navigation = makeNavigation();
      mockSuccessfulPick('bad.csv');
      FileSystem.readAsStringAsync.mockRejectedValue(new Error('oops'));

      const { getByText } = render(<UploadScreen navigation={navigation} />);
      fireEvent.press(getByText('Choose file'));

      await waitFor(() => {
        expect(navigation.navigate).not.toHaveBeenCalled();
      });
    });
  });
});
