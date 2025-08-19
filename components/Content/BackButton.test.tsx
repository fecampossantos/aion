import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import BackButton from "./BackButton";

describe("BackButton", () => {
  it("renders correctly", () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(<BackButton onPress={mockOnPress} />);
    
    expect(getByTestId("back-button")).toBeDefined();
  });

  it("calls onPress when pressed", () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(<BackButton onPress={mockOnPress} />);
    
    const button = getByTestId("back-button");
    fireEvent.press(button);
    
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it("displays the correct icon", () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(<BackButton onPress={mockOnPress} />);
    
    const icon = getByTestId("back-icon");
    expect(icon).toBeDefined();
  });
});
