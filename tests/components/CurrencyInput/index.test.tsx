import React from "react";

import { render, fireEvent } from "@testing-library/react-native";

import CurrencyInput from "../../../components/CurrencyInput";

describe("<CurrencyInput />", () => {
  const currencyIcon = "R$";
  const testID = "currencyInput-input";
  const value = "0";
  const placeholder = "currency input";
  const mockOnChange = jest.fn();

  it("renders correctly", () => {
    const { getByText } = render(
      <CurrencyInput
        value={value}
        placeholder={placeholder}
        onChange={(text: string) => mockOnChange(text)}
      />
    );
    const currency = getByText(currencyIcon);
    expect(currency).toBeDefined();
  });

  it("calls onChange when pressed and updates the input value", () => {
    const { getByTestId } = render(
      <CurrencyInput
        value={value}
        placeholder={placeholder}
        onChange={(text: string) => mockOnChange(text)}
      />
    );

    const input = getByTestId(testID);

    fireEvent.changeText(input, "1003");
    expect(mockOnChange).toHaveBeenCalledWith("10,03");
  });
});
