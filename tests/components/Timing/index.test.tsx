import React from "react";
import { render, fireEvent } from "@testing-library/react-native";

import Timing from "../../../components/Timing";
import { Timing as ITiming } from "../../interfaces/Timing";

// Mock the Feather icons
jest.mock("@expo/vector-icons", () => ({
  Feather: ({ name, size, color, ...props }) => {
    const { Text } = require("react-native");
    return <Text testID={`feather-${name}`} {...props}>{name}</Text>;
  },
}));

describe("<Timing />", () => {
  const mockTiming: ITiming = {
    timing_id: 1,
    task_id: 1,
    time: 3661, // 1 hour, 1 minute, 1 second
    created_at: "2023-12-01T10:30:45",
  };

  const mockDeleteTiming = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with timing data", () => {
    const { getByText } = render(
      <Timing
        timing={mockTiming}
        deleteTiming={mockDeleteTiming}
        isTimerRunning={false}
      />
    );

    // Check if date and time are displayed
    const dateTimeText = getByText(/01\/12\/2023 10:30:45h/);
    expect(dateTimeText).toBeDefined();

    // Check if formatted time is displayed
    const formattedTime = getByText("01:01:01");
    expect(formattedTime).toBeDefined();
  });

  it("renders trash icon", () => {
    const { getByTestId } = render(
      <Timing
        timing={mockTiming}
        deleteTiming={mockDeleteTiming}
        isTimerRunning={false}
      />
    );

    const trashIcon = getByTestId("feather-trash");
    expect(trashIcon).toBeDefined();
  });

  it("calls deleteTiming when trash icon is pressed and timer is not running", () => {
    const { getByTestId } = render(
      <Timing
        timing={mockTiming}
        deleteTiming={mockDeleteTiming}
        isTimerRunning={false}
      />
    );

    const trashIcon = getByTestId("feather-trash");
    fireEvent.press(trashIcon.parent);

    expect(mockDeleteTiming).toHaveBeenCalledTimes(1);
  });

  it("does not call deleteTiming when trash icon is pressed and timer is running", () => {
    const { getByTestId } = render(
      <Timing
        timing={mockTiming}
        deleteTiming={mockDeleteTiming}
        isTimerRunning={true}
      />
    );

    const trashIcon = getByTestId("feather-trash");
    fireEvent.press(trashIcon.parent);

    expect(mockDeleteTiming).not.toHaveBeenCalled();
  });

  it("displays correct time format for different durations", () => {
    const timingWith0Seconds: ITiming = {
      ...mockTiming,
      time: 0,
    };

    const { getByText } = render(
      <Timing
        timing={timingWith0Seconds}
        deleteTiming={mockDeleteTiming}
        isTimerRunning={false}
      />
    );

    const formattedTime = getByText("00:00:00");
    expect(formattedTime).toBeDefined();
  });

  it("displays correct time format for large durations", () => {
    const timingWithLargeDuration: ITiming = {
      ...mockTiming,
      time: 7323, // 2 hours, 2 minutes, 3 seconds
    };

    const { getByText } = render(
      <Timing
        timing={timingWithLargeDuration}
        deleteTiming={mockDeleteTiming}
        isTimerRunning={false}
      />
    );

    const formattedTime = getByText("02:02:03");
    expect(formattedTime).toBeDefined();
  });
});