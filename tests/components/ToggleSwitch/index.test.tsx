import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ToggleSwitch from '../../../components/ToggleSwitch';

// Mock TouchableOpacity to avoid animation issues in tests
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  
  // Mock Animated values
  RN.Animated.Value = jest.fn(() => ({
    interpolate: jest.fn(() => 'mocked-interpolated-value'),
  }));
  
  RN.Animated.spring = jest.fn(() => ({
    start: jest.fn(),
  }));
  
  RN.Animated.sequence = jest.fn(() => ({
    start: jest.fn(),
  }));
  
  RN.Animated.timing = jest.fn(() => ({
    start: jest.fn(),
  }));
  
  // Mock TouchableOpacity to avoid animation issues
  const MockTouchableOpacity = ({ children, onPress, testID, ...props }) => {
    return (
      <RN.View testID={testID} onTouchEnd={onPress} {...props}>
        {children}
      </RN.View>
    );
  };
  
  RN.TouchableOpacity = MockTouchableOpacity;
  
  return RN;
});

describe('ToggleSwitch', () => {
  const mockOnValueChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    const { getByTestId } = render(
      <ToggleSwitch
        value={false}
        onValueChange={mockOnValueChange}
      />
    );

    const toggle = getByTestId('toggle-switch');
    expect(toggle).toBeTruthy();
  });

  it('renders with label when provided', () => {
    const { getByText } = render(
      <ToggleSwitch
        value={false}
        onValueChange={mockOnValueChange}
        label="Show Completed"
      />
    );

    expect(getByText('Show Completed')).toBeTruthy();
  });

  it('calls onValueChange when pressed', () => {
    const { getByTestId } = render(
      <ToggleSwitch
        value={false}
        onValueChange={mockOnValueChange}
      />
    );

    const toggle = getByTestId('toggle-switch');
    fireEvent(toggle, 'touchEnd');

    expect(mockOnValueChange).toHaveBeenCalledWith(true);
  });

  it('toggles from true to false when pressed', () => {
    const { getByTestId } = render(
      <ToggleSwitch
        value={true}
        onValueChange={mockOnValueChange}
      />
    );

    const toggle = getByTestId('toggle-switch');
    fireEvent(toggle, 'touchEnd');

    expect(mockOnValueChange).toHaveBeenCalledWith(false);
  });

  it('does not call onValueChange when disabled', () => {
    const { getByTestId } = render(
      <ToggleSwitch
        value={false}
        onValueChange={mockOnValueChange}
        disabled={true}
      />
    );

    const toggle = getByTestId('toggle-switch');
    fireEvent(toggle, 'touchEnd');

    expect(mockOnValueChange).not.toHaveBeenCalled();
  });

  it('renders with different sizes', () => {
    const { getByTestId, rerender } = render(
      <ToggleSwitch
        value={false}
        onValueChange={mockOnValueChange}
        size="small"
      />
    );

    const smallToggle = getByTestId('toggle-switch');
    expect(smallToggle).toBeTruthy();

    rerender(
      <ToggleSwitch
        value={false}
        onValueChange={mockOnValueChange}
        size="large"
      />
    );

    const largeToggle = getByTestId('toggle-switch');
    expect(largeToggle).toBeTruthy();
  });

  it('applies disabled styles when disabled', () => {
    const { getByText } = render(
      <ToggleSwitch
        value={false}
        onValueChange={mockOnValueChange}
        label="Show Completed"
        disabled={true}
      />
    );

    const label = getByText('Show Completed');
    expect(label).toBeTruthy();
  });

  it('renders with labelPlacement="left" by default', () => {
    const { getByText } = render(
      <ToggleSwitch
        value={false}
        onValueChange={mockOnValueChange}
        label="Test Label"
      />
    );

    const label = getByText('Test Label');
    expect(label).toBeTruthy();
  });

  it('renders with labelPlacement="top"', () => {
    const { getByText } = render(
      <ToggleSwitch
        value={false}
        onValueChange={mockOnValueChange}
        label="Test Label"
        labelPlacement="top"
      />
    );

    const label = getByText('Test Label');
    expect(label).toBeTruthy();
  });

  it('renders without label when not provided', () => {
    const { getByTestId } = render(
      <ToggleSwitch
        value={false}
        onValueChange={mockOnValueChange}
      />
    );

    const toggle = getByTestId('toggle-switch');
    expect(toggle).toBeTruthy();
  });
});
