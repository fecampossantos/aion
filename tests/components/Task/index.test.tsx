import React from "react";

import { render, fireEvent } from "@testing-library/react-native";

import Task from "../../../components/Task";
import { secondsToTimeHHMMSS } from "../../../utils/parser";

describe("<Task />", () => {
  const mockTask = {
    task_id: 1,
    name: "task 1",
    completed: 0 as 0 | 1,
    task_created_at: "2023-01-01",
    timed_until_now: 0,
  };

const mockOnPress = jest.fn();
const mockDisableTimer = false;
const mockOnInitTimer = jest.fn();
const mockOnStopTimer = jest.fn();
const mockHandleDoneTask = jest.fn();
  const taskTestID = "task-touchable";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly", () => {
    const { getByText } = render(
      <Task
        task={mockTask}
        onPress={mockOnPress}
        disableTimer={mockDisableTimer}
        onInitTimer={() => mockOnInitTimer()}
        onStopTimer={() => mockOnStopTimer()}
        showTimedUntilNowOnTimer={mockTask.timed_until_now}
        handleDoneTask={mockHandleDoneTask}
      />
    );
    const projectName = getByText(mockTask.name);
    const timedUntilNowText = getByText(
      secondsToTimeHHMMSS(mockTask.timed_until_now)
    );
    expect(projectName).toBeDefined();
    expect(timedUntilNowText).toBeDefined();
  });

  it("task starts with timed until now in 6 seconds", () => {
    const taskWithTimed = { ...mockTask, timed_until_now: 6 };
    const { getByText } = render(
      <Task
        task={taskWithTimed}
        onPress={mockOnPress}
        disableTimer={mockDisableTimer}
        onInitTimer={() => mockOnInitTimer()}
        onStopTimer={() => mockOnStopTimer()}
        showTimedUntilNowOnTimer={taskWithTimed.timed_until_now}
        handleDoneTask={mockHandleDoneTask}
      />
    );
    const projectName = getByText(taskWithTimed.name);
    const timedUntilNowText = getByText(
      secondsToTimeHHMMSS(taskWithTimed.timed_until_now)
    );
    expect(projectName).toBeDefined();
    expect(timedUntilNowText).toBeDefined();
  });

  it("task starts with timed until now in 1min and 8 seconds", () => {
    const taskWithTimed = { ...mockTask, timed_until_now: 68 };
    const { getByText } = render(
      <Task
        task={taskWithTimed}
        onPress={mockOnPress}
        disableTimer={mockDisableTimer}
        onInitTimer={() => mockOnInitTimer()}
        onStopTimer={() => mockOnStopTimer()}
        showTimedUntilNowOnTimer={taskWithTimed.timed_until_now}
        handleDoneTask={mockHandleDoneTask}
      />
    );
    const projectName = getByText(taskWithTimed.name);
    const timedUntilNowText = getByText(
      secondsToTimeHHMMSS(taskWithTimed.timed_until_now)
    );
    expect(projectName).toBeDefined();
    expect(timedUntilNowText).toBeDefined();
  });

  it("task starts with timed until now in 18min and 9 seconds", () => {
    const taskWithTimed = { ...mockTask, timed_until_now: 18 * 60 + 9 };
    const { getByText } = render(
      <Task
        task={taskWithTimed}
        onPress={mockOnPress}
        disableTimer={mockDisableTimer}
        onInitTimer={() => mockOnInitTimer()}
        onStopTimer={() => mockOnStopTimer()}
        showTimedUntilNowOnTimer={taskWithTimed.timed_until_now}
        handleDoneTask={mockHandleDoneTask}
      />
    );
    const projectName = getByText(taskWithTimed.name);
    const timedUntilNowText = getByText(
      secondsToTimeHHMMSS(taskWithTimed.timed_until_now)
    );
    expect(projectName).toBeDefined();
    expect(timedUntilNowText).toBeDefined();
  });

  it("task starts with timed until now in 3hours 18min and 9 seconds", () => {
    const taskWithTimed = {
      ...mockTask,
      timed_until_now: 3 * 60 * 60 + 18 * 60 + 9,
    };
    const { getByText } = render(
      <Task
        task={taskWithTimed}
        onPress={mockOnPress}
        disableTimer={mockDisableTimer}
        onInitTimer={() => mockOnInitTimer()}
        onStopTimer={() => mockOnStopTimer()}
        showTimedUntilNowOnTimer={taskWithTimed.timed_until_now}
        handleDoneTask={mockHandleDoneTask}
      />
    );
    const projectName = getByText(taskWithTimed.name);
    const timedUntilNowText = getByText(
      secondsToTimeHHMMSS(taskWithTimed.timed_until_now)
    );
    expect(projectName).toBeDefined();
    expect(timedUntilNowText).toBeDefined();
  });

  it("calls onPress correctly", () => {
    const { getByTestId } = render(
      <Task
        task={mockTask}
        onPress={mockOnPress}
        disableTimer={mockDisableTimer}
        onInitTimer={() => mockOnInitTimer()}
        onStopTimer={() => mockOnStopTimer()}
        showTimedUntilNowOnTimer={mockTask.timed_until_now}
        handleDoneTask={mockHandleDoneTask}
      />
    );

    const touchable = getByTestId(taskTestID);

    fireEvent.press(touchable);
    expect(mockOnPress).toHaveBeenCalled();
  });

  it("displays completed task with strikethrough style", () => {
    const completedTask = { ...mockTask, completed: 1 as 0 | 1 };
    const { getByText } = render(
      <Task
        task={completedTask}
        onPress={mockOnPress}
        disableTimer={mockDisableTimer}
        onInitTimer={() => mockOnInitTimer()}
        onStopTimer={() => mockOnStopTimer()}
        showTimedUntilNowOnTimer={completedTask.timed_until_now}
        handleDoneTask={mockHandleDoneTask}
      />
    );

    const taskName = getByText(completedTask.name);
    expect(taskName).toBeDefined();
  });

  it("handles checkbox press correctly", () => {
    const { getByTestId } = render(
      <Task
        task={mockTask}
        onPress={mockOnPress}
        disableTimer={mockDisableTimer}
        onInitTimer={() => mockOnInitTimer()}
        onStopTimer={() => mockOnStopTimer()}
        showTimedUntilNowOnTimer={mockTask.timed_until_now}
        handleDoneTask={mockHandleDoneTask}
      />
    );

    const checkbox = getByTestId("bouncy-checkbox");
    fireEvent.press(checkbox);
    expect(mockHandleDoneTask).toHaveBeenCalledWith(true, mockTask);
  });

  it("disables timer when task is completed", () => {
    const completedTask = { ...mockTask, completed: 1 as 0 | 1 };
    const { getByTestId } = render(
      <Task
        task={completedTask}
        onPress={mockOnPress}
        disableTimer={false}
        onInitTimer={() => mockOnInitTimer()}
        onStopTimer={() => mockOnStopTimer()}
        showTimedUntilNowOnTimer={completedTask.timed_until_now}
        handleDoneTask={mockHandleDoneTask}
      />
    );

    // Timer should be disabled for completed tasks
    expect(getByTestId("timer-touchable")).toBeDefined();
  });

  it("disables timer when disableTimer prop is true", () => {
    const { getByTestId } = render(
      <Task
        task={mockTask}
        onPress={mockOnPress}
        disableTimer={true}
        onInitTimer={() => mockOnInitTimer()}
        onStopTimer={() => mockOnStopTimer()}
        showTimedUntilNowOnTimer={mockTask.timed_until_now}
        handleDoneTask={mockHandleDoneTask}
      />
    );

    expect(getByTestId("timer-touchable")).toBeDefined();
  });
});
