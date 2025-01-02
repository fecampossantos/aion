import React from "react";

import { render, fireEvent } from "@testing-library/react-native";

import Timer from "./index";

describe("<Timer />", () => {
  const timerTouchableTestID = "timer-touchable";

  it("renders correctly", () => {
    const { getByTestId } = render(<Timer />);
    const timerTouchable = getByTestId(timerTouchableTestID);
    expect(timerTouchable).toBeDefined();
  });

  it("handles touch correctly when not counting", () => {
    const onInitMock = jest.fn();
    const { getByTestId } = render(<Timer onInit={onInitMock} />);
    const timerTouchable = getByTestId(timerTouchableTestID);

    fireEvent.press(timerTouchable);

    expect(onInitMock).toHaveBeenCalledTimes(1);
  });

  it("handles touch correctly when counting", () => {
    const onStopMock = jest.fn();
    const { getByTestId } = render(<Timer onStop={onStopMock} />);
    const timerTouchable = getByTestId(timerTouchableTestID);

    fireEvent.press(timerTouchable);
    fireEvent.press(timerTouchable);

    expect(onStopMock).toHaveBeenCalledTimes(1);
  });

  it("renders correctly when disabled", () => {
    const onInitMock = jest.fn();
    const { getByTestId } = render(<Timer onInit={onInitMock} disabled />);
    const timerTouchable = getByTestId(timerTouchableTestID);
    fireEvent.press(timerTouchable);

    expect(onInitMock).not.toHaveBeenCalled();
  });
});
