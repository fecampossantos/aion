import React from "react";
import { render, fireEvent } from "@testing-library/react-native";

import TextInput from "./index";

describe("<TextInput />", () => {
  const mockOnChangeText = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly", () => {
    const { getByDisplayValue } = render(
      <TextInput
        value="test value"
        onChangeText={mockOnChangeText}
        placeholder="Test placeholder"
      />
    );
    
    const input = getByDisplayValue("test value");
    expect(input).toBeDefined();
  });

  it("displays placeholder correctly", () => {
    const { getByPlaceholderText } = render(
      <TextInput
        value=""
        onChangeText={mockOnChangeText}
        placeholder="Test placeholder"
      />
    );
    
    const input = getByPlaceholderText("Test placeholder");
    expect(input).toBeDefined();
  });

  it("calls onChangeText when text changes", () => {
    const { getByDisplayValue } = render(
      <TextInput
        value="initial"
        onChangeText={mockOnChangeText}
        placeholder="Test"
      />
    );
    
    const input = getByDisplayValue("initial");
    fireEvent.changeText(input, "new value");
    
    expect(mockOnChangeText).toHaveBeenCalledWith("new value");
    expect(mockOnChangeText).toHaveBeenCalledTimes(1);
  });

  it("handles empty value", () => {
    const { getByPlaceholderText } = render(
      <TextInput
        value=""
        onChangeText={mockOnChangeText}
        placeholder="Empty test"
      />
    );
    
    const input = getByPlaceholderText("Empty test");
    expect(input).toBeDefined();
    expect(input.props.value).toBe("");
  });

  it("passes through additional props", () => {
    const { getByDisplayValue } = render(
      <TextInput
        value="test"
        onChangeText={mockOnChangeText}
        placeholder="Test"
        multiline={true}
        numberOfLines={4}
      />
    );
    
    const input = getByDisplayValue("test");
    expect(input.props.multiline).toBe(true);
    expect(input.props.numberOfLines).toBe(4);
  });
});