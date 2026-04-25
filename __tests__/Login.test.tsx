import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Login from '../src/screens/Login';
import {
  getAuthRecord,
  verifyLocalAuth,
  registerLocalAuth,
} from '../src/utils/auth';

jest.mock('../src/utils/auth', () => ({
  getAuthRecord: jest.fn(),
  verifyLocalAuth: jest.fn(),
  registerLocalAuth: jest.fn(),
  saveAuthRecord: jest.fn(),
  clearAuthRecord: jest.fn(),
  hasAuthRecord: jest.fn(),
}));

describe('Login', () => {
  const navigation = {
    navigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the login form', () => {
    const screen = render(<Login navigation={navigation as any} />);
    expect(screen.getByText('Welcome to your library')).toBeTruthy();
    expect(screen.getByPlaceholderText('Username')).toBeTruthy();
    expect(screen.getByPlaceholderText('Password')).toBeTruthy();
    expect(screen.getByText('Login')).toBeTruthy();
    expect(screen.getByText('Register')).toBeTruthy();
  });
  test('shows error message when username is empty', async () => {
    const screen = render(<Login navigation={navigation as any} />);
    fireEvent.press(screen.getByText('Login'));
    await waitFor(() => {
      expect(
        screen.getByText('Please enter a username and password'),
      ).toBeTruthy();
    });
    expect(screen.queryByText('Login')).toBeNull();
  });
});
