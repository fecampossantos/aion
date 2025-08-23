import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import LastWorkedTask from "../../../components/LastWorkedTask";

// Mock the theme and parser utilities
jest.mock("../../../globalStyle/theme", () => ({
  theme: {
    colors: {
      neutral: {
        800: "#1f2937",
        400: "#9ca3af",
      },
      primary: {
        500: "#3b82f6",
        400: "#60a5fa",
      },
      white: "#ffffff",
    },
    borderRadius: {
      lg: 8,
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
    },
    typography: {
      fontSize: {
        xs: 12,
        sm: 14,
        md: 16,
      },
      fontFamily: {
        regular: "System",
        medium: "System",
      },
    },
    shadows: {
      sm: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
      },
    },
  },
}));

jest.mock("../../../utils/parser", () => ({
  fullDateWithHour: jest.fn((dateString) => ({
    d: "01/01/2024",
    time: "10:30:00",
  })),
}));

describe("LastWorkedTask", () => {
  const mockTask = {
    task_id: 1,
    name: "Test Task",
    completed: 0 as 0 | 1,
    task_created_at: "2024-01-01 10:00:00",
    timed_until_now: 3600, // 1 hour in seconds
    project_id: 1,
    project_name: "Test Project",
    last_timing_date: "2024-01-01 10:30:00",
  };

  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders task name and last worked information", () => {
    const { getByText } = render(
      <LastWorkedTask task={mockTask} onPress={mockOnPress} />
    );

    expect(getByText("Test Task")).toBeTruthy();
    expect(getByText("Última vez trabalhado: 01/01/2024 at 10:30:00")).toBeTruthy();
    expect(getByText("1:00:00")).toBeTruthy(); // 1 hour formatted
    expect(getByText("Tempo total")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    const { getByTestId } = render(
      <LastWorkedTask task={mockTask} onPress={mockOnPress} />
    );

    const touchable = getByTestId("last-worked-task-touchable");
    fireEvent.press(touchable);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it("handles task with no time worked", () => {
    const taskWithNoTime = {
      ...mockTask,
      timed_until_now: 0,
      last_timing_date: "",
    };

    const { getByText } = render(
      <LastWorkedTask task={taskWithNoTime} onPress={mockOnPress} />
    );

    expect(getByText("Última vez trabalhado: Nunca trabalhado")).toBeTruthy();
    expect(getByText("0:00:00")).toBeTruthy();
  });

  it("handles task with less than 1 hour of time", () => {
    const taskWithShortTime = {
      ...mockTask,
      timed_until_now: 1800, // 30 minutes in seconds
    };

    const { getByText } = render(
      <LastWorkedTask task={taskWithShortTime} onPress={mockOnPress} />
    );

    expect(getByText("30:00")).toBeTruthy(); // 30 minutes formatted
  });

  it("handles long task names with numberOfLines", () => {
    const taskWithLongName = {
      ...mockTask,
      name: "This is a very long task name that should be truncated to two lines maximum to prevent layout issues",
    };

    const { getByText } = render(
      <LastWorkedTask task={taskWithLongName} onPress={mockOnPress} />
    );

    expect(getByText(taskWithLongName.name)).toBeTruthy();
  });
});
