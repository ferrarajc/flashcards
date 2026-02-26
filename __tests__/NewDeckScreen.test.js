import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import NewDeckScreen from '../screens/NewDeckScreen';

function makeNavigation() {
  return { navigate: jest.fn() };
}

describe('NewDeckScreen', () => {
  describe('rendering', () => {
    it('shows the heading', () => {
      const { getByText } = render(<NewDeckScreen navigation={makeNavigation()} />);
      expect(getByText('New deck')).toBeTruthy();
    });

    it('shows the subheading', () => {
      const { getByText } = render(<NewDeckScreen navigation={makeNavigation()} />);
      expect(getByText('How do you want to add cards?')).toBeTruthy();
    });

    it('shows the Type it in option', () => {
      const { getByText } = render(<NewDeckScreen navigation={makeNavigation()} />);
      expect(getByText('Type it in')).toBeTruthy();
    });

    it('shows the Upload a file option', () => {
      const { getByText } = render(<NewDeckScreen navigation={makeNavigation()} />);
      expect(getByText('Upload a file')).toBeTruthy();
    });
  });

  describe('navigation', () => {
    it('tapping Type it in navigates to ManualCreate', () => {
      const navigation = makeNavigation();
      const { getByText } = render(<NewDeckScreen navigation={navigation} />);
      fireEvent.press(getByText('Type it in'));
      expect(navigation.navigate).toHaveBeenCalledWith('ManualCreate');
    });

    it('tapping Upload a file navigates to Upload', () => {
      const navigation = makeNavigation();
      const { getByText } = render(<NewDeckScreen navigation={navigation} />);
      fireEvent.press(getByText('Upload a file'));
      expect(navigation.navigate).toHaveBeenCalledWith('Upload');
    });

    it('tapping Type it in does not navigate to Upload', () => {
      const navigation = makeNavigation();
      const { getByText } = render(<NewDeckScreen navigation={navigation} />);
      fireEvent.press(getByText('Type it in'));
      expect(navigation.navigate).not.toHaveBeenCalledWith('Upload');
    });
  });
});
