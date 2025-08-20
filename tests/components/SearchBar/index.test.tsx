import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SearchBar from '../../../components/SearchBar';

describe('SearchBar', () => {
  const mockOnChangeText = jest.fn();
  const mockOnClear = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    const { getByPlaceholderText } = render(
      <SearchBar
        value=""
        onChangeText={mockOnChangeText}
      />
    );

    expect(getByPlaceholderText('Search...')).toBeTruthy();
  });

  it('renders with custom placeholder', () => {
    const { getByPlaceholderText } = render(
      <SearchBar
        value=""
        onChangeText={mockOnChangeText}
        placeholder="Custom placeholder"
      />
    );

    expect(getByPlaceholderText('Custom placeholder')).toBeTruthy();
  });

  it('displays the search value correctly', () => {
    const { getByDisplayValue } = render(
      <SearchBar
        value="test search"
        onChangeText={mockOnChangeText}
      />
    );

    expect(getByDisplayValue('test search')).toBeTruthy();
  });

  it('calls onChangeText when text is entered', () => {
    const { getByPlaceholderText } = render(
      <SearchBar
        value=""
        onChangeText={mockOnChangeText}
      />
    );

    const input = getByPlaceholderText('Search...');
    fireEvent.changeText(input, 'new text');

    expect(mockOnChangeText).toHaveBeenCalledWith('new text');
  });

  it('shows clear button when there is text and onClear is provided', () => {
    const { getByTestId } = render(
      <SearchBar
        value="test"
        onChangeText={mockOnChangeText}
        onClear={mockOnClear}
      />
    );

    const clearButton = getByTestId('clear-button');
    expect(clearButton).toBeTruthy();
  });

  it('hides clear button when there is no text', () => {
    const { queryByTestId } = render(
      <SearchBar
        value=""
        onChangeText={mockOnChangeText}
        onClear={mockOnClear}
      />
    );

    const clearButton = queryByTestId('clear-button');
    expect(clearButton).toBeFalsy();
  });

  it('calls onClear when clear button is pressed', () => {
    const { getByTestId } = render(
      <SearchBar
        value="test"
        onChangeText={mockOnChangeText}
        onClear={mockOnClear}
      />
    );

    const clearButton = getByTestId('clear-button');
    fireEvent.press(clearButton);

    expect(mockOnClear).toHaveBeenCalled();
    expect(mockOnChangeText).toHaveBeenCalledWith('');
  });

  it('does not show clear button when onClear is not provided', () => {
    const { queryByTestId } = render(
      <SearchBar
        value="test"
        onChangeText={mockOnChangeText}
      />
    );

    const clearButton = queryByTestId('clear-button');
    expect(clearButton).toBeFalsy();
  });
});
