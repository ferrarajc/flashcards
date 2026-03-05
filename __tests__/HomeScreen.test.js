import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from '../screens/HomeScreen';

jest.setTimeout(15000);

// ── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (cb) => {
    const { useEffect } = require('react');
    useEffect(cb, []);
  },
}));

jest.mock('../components/SidebarLayout', () => {
  const { View } = require('react-native');
  return ({ children }) => <View>{children}</View>;
});

jest.mock('../components/ScreenContainer', () => {
  const { View } = require('react-native');
  return ({ children }) => <View>{children}</View>;
});

// Default: desktop layout
const mockBreakpoint = { isPhone: false, isTablet: false, isDesktop: true };
jest.mock('../hooks/useBreakpoint', () => ({
  useBreakpoint: () => mockBreakpoint,
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeNavigation() {
  return { navigate: jest.fn(), setOptions: jest.fn() };
}

const DECK_A = {
  id: '1',
  name: 'Alpha',
  cards: [{ front: 'Q1', back: 'A1' }],
  isNew: false,
  createdAt: 1000,
  lastAccessedAt: 5000,
};

const DECK_B = {
  id: '2',
  name: 'Beta',
  cards: [{ front: 'Q2', back: 'A2' }, { front: 'Q3', back: 'A3' }],
  isNew: false,
  createdAt: 2000,
  lastAccessedAt: 3000,
};

const DECK_NEW = {
  id: '3',
  name: 'Zeta',
  cards: [{ front: 'Q4', back: 'A4' }],
  isNew: true,
  createdAt: Date.now(),
  lastAccessedAt: 1000,
};

async function renderWithDecks(decks, navigation) {
  await AsyncStorage.setItem('decks', JSON.stringify(decks));
  const nav = navigation ?? makeNavigation();
  const utils = render(<HomeScreen navigation={nav} />);
  // Wait for loadDecks to complete
  await waitFor(() => expect(utils.getByText(decks[0].name)).toBeTruthy());
  return { ...utils, nav };
}

beforeEach(() => {
  jest.clearAllMocks();
  AsyncStorage.clear();
});

// ── Rendering ─────────────────────────────────────────────────────────────────

describe('rendering', () => {
  it('shows Decks heading', async () => {
    const { getByText } = await renderWithDecks([DECK_A]);
    expect(getByText('Decks')).toBeTruthy();
  });

  it('renders each deck name', async () => {
    const { getByText } = await renderWithDecks([DECK_A, DECK_B]);
    expect(getByText('Alpha')).toBeTruthy();
    expect(getByText('Beta')).toBeTruthy();
  });

  it('shows card count for each deck', async () => {
    const { getByText } = await renderWithDecks([DECK_A, DECK_B]);
    expect(getByText('1 cards')).toBeTruthy();
    expect(getByText('2 cards')).toBeTruthy();
  });

  it('shows New badge on new decks', async () => {
    const { getByText } = await renderWithDecks([DECK_NEW]);
    expect(getByText('New')).toBeTruthy();
  });

  it('does not show New badge on non-new decks', async () => {
    const { queryByText } = await renderWithDecks([DECK_A]);
    expect(queryByText('New')).toBeNull();
  });
});

// ── Empty state ───────────────────────────────────────────────────────────────

describe('empty state', () => {
  it('shows empty state heading when no decks', async () => {
    render(<HomeScreen navigation={makeNavigation()} />);
    await waitFor(() => {
      // loadDecks resolves with nothing, so empty state shows
    });
    const { getByText } = render(<HomeScreen navigation={makeNavigation()} />);
    await waitFor(() => expect(getByText('No decks yet')).toBeTruthy());
  });

  it('shows CTA button in empty state', async () => {
    const { getByText } = render(<HomeScreen navigation={makeNavigation()} />);
    await waitFor(() => expect(getByText('+ Create your first deck')).toBeTruthy());
  });

  it('CTA navigates to NewDeck', async () => {
    const nav = makeNavigation();
    const { getByText } = render(<HomeScreen navigation={nav} />);
    await waitFor(() => expect(getByText('+ Create your first deck')).toBeTruthy());
    fireEvent.press(getByText('+ Create your first deck'));
    expect(nav.navigate).toHaveBeenCalledWith('NewDeck');
  });
});

// ── Auto-expire New badge ─────────────────────────────────────────────────────

describe('auto-expire New badge', () => {
  it('strips isNew when deck was created more than 7 days ago', async () => {
    const oldNewDeck = {
      ...DECK_NEW,
      id: '99',
      createdAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
    };
    const { queryByText } = await renderWithDecks([oldNewDeck]);
    expect(queryByText('New')).toBeNull();
  });
});

// ── Sort control ──────────────────────────────────────────────────────────────

describe('sort control', () => {
  it('is not shown when there is only one deck', async () => {
    const { queryByText } = await renderWithDecks([DECK_A]);
    expect(queryByText('Recent')).toBeNull();
    expect(queryByText('A–Z')).toBeNull();
  });

  it('is shown when there are two or more decks', async () => {
    const { getByText } = await renderWithDecks([DECK_A, DECK_B]);
    expect(getByText('Recent')).toBeTruthy();
    expect(getByText('A–Z')).toBeTruthy();
  });

  it('defaults to Recent sort — new-badged deck appears first', async () => {
    // DECK_NEW has isNew:true but low lastAccessedAt; should still sort first
    const decks = [DECK_A, DECK_NEW];
    await AsyncStorage.setItem('decks', JSON.stringify(decks));
    const nav = makeNavigation();
    const { getAllByText } = render(<HomeScreen navigation={nav} />);
    await waitFor(() => getAllByText(/Alpha|Zeta/));
    const names = getAllByText(/Alpha|Zeta/).map(n => n.props.children);
    expect(names[0]).toBe('Zeta'); // new deck first
  });

  it('A-Z sort orders alphabetically', async () => {
    // Beta created more recently so would be first in Recent; in A-Z Alpha should lead
    const decks = [DECK_B, DECK_A]; // B stored first
    await AsyncStorage.setItem('decks', JSON.stringify(decks));
    const { getByText, getAllByText } = render(<HomeScreen navigation={makeNavigation()} />);
    await waitFor(() => getByText('Beta'));
    fireEvent.press(getByText('A–Z'));
    const names = getAllByText(/Alpha|Beta/).map(n => n.props.children);
    expect(names[0]).toBe('Alpha');
  });

  it('switching back to Recent after A-Z restores recency order', async () => {
    // DECK_A has higher lastAccessedAt (5000) so should be first in Recent
    const decks = [DECK_B, DECK_A];
    await AsyncStorage.setItem('decks', JSON.stringify(decks));
    const { getByText, getAllByText } = render(<HomeScreen navigation={makeNavigation()} />);
    await waitFor(() => getByText('Beta'));
    fireEvent.press(getByText('A–Z'));
    fireEvent.press(getByText('Recent'));
    const names = getAllByText(/Alpha|Beta/).map(n => n.props.children);
    expect(names[0]).toBe('Alpha'); // lastAccessedAt 5000 > 3000
  });
});

// ── Context menu ─────────────────────────────────────────────────────────────

describe('context menu (desktop popup)', () => {
  it('opens when ••• is pressed', async () => {
    const { getAllByText, getByText } = await renderWithDecks([DECK_A]);
    fireEvent.press(getAllByText('•••')[0]);
    await waitFor(() => expect(getByText('Study')).toBeTruthy());
  });

  it('shows deck name as menu title', async () => {
    const { getAllByText, getAllByText: getAll } = await renderWithDecks([DECK_A]);
    fireEvent.press(getAllByText('•••')[0]);
    await waitFor(() => {
      const alphas = getAll('Alpha');
      // One in the list, one in the menu title
      expect(alphas.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('Study navigates to ModeSelect', async () => {
    const nav = makeNavigation();
    const { getAllByText, getByText } = await renderWithDecks([DECK_A], nav);
    fireEvent.press(getAllByText('•••')[0]);
    await waitFor(() => getByText('Study'));
    fireEvent.press(getByText('Study'));
    expect(nav.navigate).toHaveBeenCalledWith('ModeSelect', expect.objectContaining({ deck: expect.objectContaining({ id: '1' }) }));
  });

  it('Edit cards navigates to EditDeck', async () => {
    const nav = makeNavigation();
    const { getAllByText, getByText } = await renderWithDecks([DECK_A], nav);
    fireEvent.press(getAllByText('•••')[0]);
    await waitFor(() => getByText('Edit cards'));
    fireEvent.press(getByText('Edit cards'));
    expect(nav.navigate).toHaveBeenCalledWith('EditDeck', { deck: expect.objectContaining({ id: '1' }) });
  });

  it('Rename opens the rename modal', async () => {
    const { getAllByText, getByText } = await renderWithDecks([DECK_A]);
    fireEvent.press(getAllByText('•••')[0]);
    await waitFor(() => getByText('Rename'));
    fireEvent.press(getByText('Rename'));
    await waitFor(() => expect(getByText('Rename deck')).toBeTruthy());
  });

  it('Delete opens the delete confirmation modal', async () => {
    const { getAllByText, getByText } = await renderWithDecks([DECK_A]);
    fireEvent.press(getAllByText('•••')[0]);
    await waitFor(() => getByText('Delete'));
    fireEvent.press(getByText('Delete'));
    await waitFor(() => expect(getByText('Delete deck?')).toBeTruthy());
  });
});

// ── Rename flow ───────────────────────────────────────────────────────────────

describe('rename flow', () => {
  it('saves updated name to AsyncStorage', async () => {
    const { getAllByText, getByText, getByDisplayValue } = await renderWithDecks([DECK_A]);
    fireEvent.press(getAllByText('•••')[0]);
    await waitFor(() => getByText('Rename'));
    fireEvent.press(getByText('Rename'));
    await waitFor(() => getByText('Rename deck'));
    fireEvent.changeText(getByDisplayValue('Alpha'), 'Alpha Renamed');
    fireEvent.press(getByText('Save'));
    await waitFor(() => {
      const calls = AsyncStorage.setItem.mock.calls;
      const lastSave = JSON.parse(calls[calls.length - 1][1]);
      expect(lastSave[0].name).toBe('Alpha Renamed');
    });
  });

  it('Cancel closes rename modal without saving', async () => {
    const { getAllByText, getByText, getByDisplayValue, queryByText } = await renderWithDecks([DECK_A]);
    fireEvent.press(getAllByText('•••')[0]);
    await waitFor(() => getByText('Rename'));
    fireEvent.press(getByText('Rename'));
    await waitFor(() => getByText('Rename deck'));
    fireEvent.changeText(getByDisplayValue('Alpha'), 'Should Not Save');
    fireEvent.press(getByText('Cancel'));
    await waitFor(() => expect(queryByText('Rename deck')).toBeNull());
    expect(getByText('Alpha')).toBeTruthy();
  });
});

// ── Delete flow ───────────────────────────────────────────────────────────────

describe('delete flow', () => {
  it('removes deck from list on confirm', async () => {
    const { getAllByText, getByText, queryByText } = await renderWithDecks([DECK_A, DECK_B]);
    // Open menu for Alpha (first ••• button)
    fireEvent.press(getAllByText('•••')[0]);
    await waitFor(() => getByText('Delete'));
    fireEvent.press(getByText('Delete'));
    await waitFor(() => getByText('Delete deck?'));
    fireEvent.press(getByText('Delete'));
    await waitFor(() => expect(queryByText('Alpha')).toBeNull());
    expect(getByText('Beta')).toBeTruthy();
  });

  it('Cancel leaves deck intact', async () => {
    const { getAllByText, getByText } = await renderWithDecks([DECK_A]);
    fireEvent.press(getAllByText('•••')[0]);
    await waitFor(() => getByText('Delete'));
    fireEvent.press(getByText('Delete'));
    await waitFor(() => getByText('Delete deck?'));
    fireEvent.press(getByText('Cancel'));
    await waitFor(() => expect(getByText('Alpha')).toBeTruthy());
  });

  it('persists deletion to AsyncStorage', async () => {
    const { getAllByText, getByText } = await renderWithDecks([DECK_A, DECK_B]);
    fireEvent.press(getAllByText('•••')[0]);
    await waitFor(() => getByText('Delete'));
    fireEvent.press(getByText('Delete'));
    await waitFor(() => getByText('Delete deck?'));
    fireEvent.press(getByText('Delete'));
    await waitFor(() => {
      const calls = AsyncStorage.setItem.mock.calls;
      const lastSave = JSON.parse(calls[calls.length - 1][1]);
      expect(lastSave.every(d => d.id !== '1')).toBe(true);
    });
  });
});

// ── openDeck ──────────────────────────────────────────────────────────────────

describe('opening a deck', () => {
  it('navigates to ModeSelect', async () => {
    const nav = makeNavigation();
    const { getByText } = await renderWithDecks([DECK_A], nav);
    fireEvent.press(getByText('Alpha'));
    expect(nav.navigate).toHaveBeenCalledWith('ModeSelect', expect.objectContaining({
      deck: expect.objectContaining({ id: '1' }),
    }));
  });

  it('clears isNew flag on open', async () => {
    const nav = makeNavigation();
    const { getByText } = await renderWithDecks([DECK_NEW], nav);
    fireEvent.press(getByText('Zeta'));
    await waitFor(() => {
      const calls = AsyncStorage.setItem.mock.calls;
      const lastSave = JSON.parse(calls[calls.length - 1][1]);
      expect(lastSave[0].isNew).toBe(false);
    });
  });

  it('stamps lastAccessedAt on open', async () => {
    const before = Date.now();
    const nav = makeNavigation();
    const { getByText } = await renderWithDecks([DECK_A], nav);
    fireEvent.press(getByText('Alpha'));
    await waitFor(() => {
      const calls = AsyncStorage.setItem.mock.calls;
      const lastSave = JSON.parse(calls[calls.length - 1][1]);
      expect(lastSave[0].lastAccessedAt).toBeGreaterThanOrEqual(before);
    });
  });
});

// ── New deck button ───────────────────────────────────────────────────────────

describe('new deck button', () => {
  it('is shown on desktop when decks exist', async () => {
    const { getByText } = await renderWithDecks([DECK_A]);
    expect(getByText('+ New deck')).toBeTruthy();
  });

  it('navigates to NewDeck when pressed', async () => {
    const nav = makeNavigation();
    const { getByText } = await renderWithDecks([DECK_A], nav);
    fireEvent.press(getByText('+ New deck'));
    expect(nav.navigate).toHaveBeenCalledWith('NewDeck');
  });
});
