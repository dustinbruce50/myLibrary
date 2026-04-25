import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AppButton from '../../src/components/AppButton';

describe('AppButton', () => {
  test('renders the title', () => {
    const screen = render(<AppButton title="Test Button" onPress={() => {}} />);
    expect(screen.getByText('Test Button')).toBeTruthy();
  });
  test('calls onPress when button is pressed', () => {
    const onPress = jest.fn();
    const screen = render(<AppButton title="Test Button" onPress={onPress} />);
    fireEvent.press(screen.getByText('Test Button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
