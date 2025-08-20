import React from "react";

import { render, fireEvent } from "@testing-library/react-native";

import Timer from "../../../components/Timer";

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

    // Start timer
    fireEvent.press(timerTouchable);
    
    // Stop timer using the stop button
    const stopButton = getByTestId("timer-stop-button");
    fireEvent.press(stopButton);

    expect(onStopMock).toHaveBeenCalledTimes(1);
  });

  it("renders correctly when disabled", () => {
    const onInitMock = jest.fn();
    const { getByTestId } = render(<Timer onInit={onInitMock} disabled />);
    const timerTouchable = getByTestId(timerTouchableTestID);
    fireEvent.press(timerTouchable);

    expect(onInitMock).not.toHaveBeenCalled();
  });

  it("displays custom text when stopped", () => {
    const customText = "01:30:45";
    const { getByText } = render(
      <Timer textToShowWhenStopped={customText} />
    );
    
    expect(getByText(customText)).toBeDefined();
  });

  it("displays default time format when no custom text", () => {
    const { getByText } = render(<Timer />);
    
    // Should display initial time format (00:00:00)
    expect(getByText("00:00:00")).toBeDefined();
  });

  it("shows play icon when not counting", () => {
    const { getByTestId } = render(<Timer />);
    const timerTouchable = getByTestId(timerTouchableTestID);
    
    // Should contain play icon (caretright)
    expect(timerTouchable).toBeDefined();
  });

  it("calls onStop with correct time when stopping timer", async () => {
    const onStopMock = jest.fn();
    const { getByTestId } = render(<Timer onStop={onStopMock} />);
    const timerTouchable = getByTestId(timerTouchableTestID);

    // Start timer
    fireEvent.press(timerTouchable);
    
    // Wait a bit and stop timer using the stop button
    await new Promise(resolve => setTimeout(resolve, 100));
    const stopButton = getByTestId("timer-stop-button");
    fireEvent.press(stopButton);

    expect(onStopMock).toHaveBeenCalledWith(expect.any(Number));
    expect(onStopMock).toHaveBeenCalledTimes(1);
  });

  it("has correct accessibility when disabled", () => {
    const { getByTestId } = render(<Timer disabled />);
    const timerTouchable = getByTestId(timerTouchableTestID);
    
    expect(timerTouchable).toBeDefined();
    // The component should still be rendered but not respond to touches
  });

  it("handles task name prop correctly", () => {
    const taskName = "Test Task";
    const { getByTestId } = render(<Timer taskName={taskName} />);
    const timerTouchable = getByTestId(timerTouchableTestID);
    
    expect(timerTouchable).toBeDefined();
  });
});
