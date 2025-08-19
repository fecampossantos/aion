import React from "react";

import { render, fireEvent } from "@testing-library/react-native";

import Button from "../../../components/Button";

describe("<Button />", () => {
  const buttonText = "button";
  const mockOnPress = jest.fn();

  it("renders correctly", () => {
    const { getByText } = render(
      <Button onPress={() => mockOnPress()} text={buttonText} />
    );
    const bt = getByText(buttonText);
    expect(bt).toBeDefined();
  });

  it("call on press when pressed", () => {
    const { getByText } = render(
      <Button onPress={() => mockOnPress()} text={buttonText} />
    );
    const bt = getByText(buttonText);
    fireEvent(bt, "press");
    expect(mockOnPress).toHaveBeenCalled();
  });
});
