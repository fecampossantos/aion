import React from "react";
import { render, fireEvent } from "@testing-library/react-native";

import CheckBox from "../../../components/CheckBox";

// Mock the BouncyCheckbox component
jest.mock("react-native-bouncy-checkbox", () => {
  const React = require("react");
  const { Pressable, Text } = require("react-native");
  
  return ({ onPress, isChecked, size, fillColor, unfillColor, innerIconStyle }) => (
    <Pressable
      testID="bouncy-checkbox"
      onPress={() => onPress(!isChecked)}
    >
      <Text testID="checkbox-state">{isChecked ? "checked" : "unchecked"}</Text>
    </Pressable>
  );
});

describe("<CheckBox />", () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly when unchecked", () => {
    const { getByTestId, getByText } = render(
      <CheckBox onPress={mockOnPress} isChecked={false} />
    );
    
    const checkbox = getByTestId("bouncy-checkbox");
    const state = getByText("unchecked");
    
    expect(checkbox).toBeDefined();
    expect(state).toBeDefined();
  });

  it("renders correctly when checked", () => {
    const { getByTestId, getByText } = render(
      <CheckBox onPress={mockOnPress} isChecked={true} />
    );
    
    const checkbox = getByTestId("bouncy-checkbox");
    const state = getByText("checked");
    
    expect(checkbox).toBeDefined();
    expect(state).toBeDefined();
  });

  it("calls onPress with correct value when pressed and unchecked", () => {
    const { getByTestId } = render(
      <CheckBox onPress={mockOnPress} isChecked={false} />
    );
    
    const checkbox = getByTestId("bouncy-checkbox");
    fireEvent.press(checkbox);
    
    expect(mockOnPress).toHaveBeenCalledWith(true);
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it("calls onPress with correct value when pressed and checked", () => {
    const { getByTestId } = render(
      <CheckBox onPress={mockOnPress} isChecked={true} />
    );
    
    const checkbox = getByTestId("bouncy-checkbox");
    fireEvent.press(checkbox);
    
    expect(mockOnPress).toHaveBeenCalledWith(false);
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});