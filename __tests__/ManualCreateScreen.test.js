import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ManualCreateScreen from '../screens/ManualCreateScreen';

jest.setTimeout(15000);

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeNav() {
  return { navigate: jest.fn(), goBack: jest.fn() };
}

function renderScreen(nav) {
  const navigation = nav ?? makeNav();
  const utils = render(<ManualCreateScreen navigation={navigation} />);

  // Trigger the layout event on the card area so cardWidth > 0 and cards render
  const cardArea = utils.getByTestId('cardArea');
  fireEvent(cardArea, 'layout', { nativeEvent: { layout: { width: 375, height: 300 } } });

  return { ...utils, navigation };
}

// ── Rendering ─────────────────────────────────────────────────────────────────

describe('ManualCreateScreen rendering', () => {
  it('renders "Untitled deck" as the default deck name', () => {
    const { getByDisplayValue } = renderScreen();
    expect(getByDisplayValue('Untitled deck')).toBeTruthy();
  });

  it('renders the Done button in the header', () => {
    const { getByText } = renderScreen();
    expect(getByText('Done')).toBeTruthy();
  });

  it('renders a Front card page and a Back card page for the initial card', async () => {
    const { getByText } = renderScreen();
    await waitFor(() => {
      expect(getByText('Front')).toBeTruthy();
    });
  });
});

// ── Deck name ─────────────────────────────────────────────────────────────────

describe('deck name input', () => {
  it('updates deck name when user types', () => {
    const { getByDisplayValue } = renderScreen();
    const input = getByDisplayValue('Untitled deck');
    fireEvent.changeText(input, 'My Spanish Vocab');
    expect(getByDisplayValue('My Spanish Vocab')).toBeTruthy();
  });
});

// ── Save (Done) validation ────────────────────────────────────────────────────

describe('save validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue(undefined);
  });

  it('shows an Alert when all cards are empty and Done is pressed', async () => {
    const { Alert } = require('react-native');
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    const nav = makeNav();
    const { getByText } = renderScreen(nav);

    fireEvent.press(getByText('Done'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('No cards', expect.any(String));
    });

    expect(nav.navigate).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('saves the deck and navigates to Home when a card has content', async () => {
    const nav = makeNav();
    const { getByText, getByPlaceholderText } = renderScreen(nav);

    // Type a question into the front card
    await waitFor(() => getByPlaceholderText('Type a question'));
    fireEvent.changeText(getByPlaceholderText('Type a question'), 'What is React?');

    fireEvent.press(getByText('Done'));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalled();
      expect(nav.navigate).toHaveBeenCalledWith('Home');
    });
  });

  it('saves deck name to AsyncStorage', async () => {
    const nav = makeNav();
    const { getByText, getByDisplayValue, getByPlaceholderText } = renderScreen(nav);

    fireEvent.changeText(getByDisplayValue('Untitled deck'), 'French Basics');
    await waitFor(() => getByPlaceholderText('Type a question'));
    fireEvent.changeText(getByPlaceholderText('Type a question'), 'Bonjour means?');

    fireEvent.press(getByText('Done'));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalled();
      const saved = JSON.parse(AsyncStorage.setItem.mock.calls[0][1]);
      expect(saved[0].name).toBe('French Basics');
    });
  });

  it('strips empty cards before saving (only saves cards with content)', async () => {
    const nav = makeNav();
    const { getByText, getByPlaceholderText } = renderScreen(nav);

    // Fill in the first card
    await waitFor(() => getByPlaceholderText('Type a question'));
    fireEvent.changeText(getByPlaceholderText('Type a question'), 'Capital of France?');

    fireEvent.press(getByText('Done'));

    await waitFor(() => {
      const saved = JSON.parse(AsyncStorage.setItem.mock.calls[0][1]);
      expect(saved[0].cards).toHaveLength(1);
      expect(saved[0].cards[0].front).toBe('Capital of France?');
    });
  });

  it('uses "Untitled deck" when deck name is only whitespace', async () => {
    const nav = makeNav();
    const { getByText, getByDisplayValue, getByPlaceholderText } = renderScreen(nav);

    fireEvent.changeText(getByDisplayValue('Untitled deck'), '   ');
    await waitFor(() => getByPlaceholderText('Type a question'));
    fireEvent.changeText(getByPlaceholderText('Type a question'), 'Q?');

    fireEvent.press(getByText('Done'));

    await waitFor(() => {
      const saved = JSON.parse(AsyncStorage.setItem.mock.calls[0][1]);
      expect(saved[0].name).toBe('Untitled deck');
    });
  });

  it('appends new deck to existing decks in storage', async () => {
    const existing = [{ id: '99', name: 'Existing', cards: [{ front: 'a', back: 'b' }] }];
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify(existing));

    const nav = makeNav();
    const { getByText, getByPlaceholderText } = renderScreen(nav);

    await waitFor(() => getByPlaceholderText('Type a question'));
    fireEvent.changeText(getByPlaceholderText('Type a question'), 'Q?');

    fireEvent.press(getByText('Done'));

    await waitFor(() => {
      const saved = JSON.parse(AsyncStorage.setItem.mock.calls[0][1]);
      expect(saved).toHaveLength(2);
      expect(saved[0].id).toBe('99');
    });
  });

  it('marks the new deck with isNew: true', async () => {
    const nav = makeNav();
    const { getByText, getByPlaceholderText } = renderScreen(nav);

    await waitFor(() => getByPlaceholderText('Type a question'));
    fireEvent.changeText(getByPlaceholderText('Type a question'), 'Test Q');

    fireEvent.press(getByText('Done'));

    await waitFor(() => {
      const saved = JSON.parse(AsyncStorage.setItem.mock.calls[0][1]);
      expect(saved[0].isNew).toBe(true);
    });
  });
});

// ── Card management ───────────────────────────────────────────────────────────

describe('card management', () => {
  it('shows "Front" and "Back" labels for the initial card', async () => {
    const { getByText } = renderScreen();
    await waitFor(() => getByText('Front'));
    expect(getByText('Back')).toBeTruthy();
  });

  it('shows ••• card menu button', async () => {
    const { getAllByText } = renderScreen();
    await waitFor(() => getAllByText('•••'));
    expect(getAllByText('•••').length).toBeGreaterThan(0);
  });

  it('pressing ••• on iOS shows ActionSheetIOS (integration smoke test)', async () => {
    const { Platform, ActionSheetIOS } = require('react-native');
    const originalOS = Platform.OS;
    Platform.OS = 'ios';

    const showSpy = jest.spyOn(ActionSheetIOS, 'showActionSheetWithOptions')
      .mockImplementation(() => {});

    const { getAllByText } = renderScreen();
    await waitFor(() => getAllByText('•••'));
    fireEvent.press(getAllByText('•••')[0]);

    expect(showSpy).toHaveBeenCalled();
    showSpy.mockRestore();
    Platform.OS = originalOS;
  });
});
