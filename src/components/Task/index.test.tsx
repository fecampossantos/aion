import React from "react";

import { render, fireEvent } from "@testing-library/react-native";

import Task, { TaskWithTimed } from "./index";
import { secondsToTimeHHMMSS } from "../../../utils/parser";

describe("<Task />", () => {
  const mockTask: TaskWithTimed = {
    task_id: 1,
    project_id: 1,
    name: "task 1",
    completed: false,
    created_at: new Date(),
    timed_until_now: 0,
  };

  const mockOnPress = jest.fn();
  const mockDisableTimer = false;
  const mockOnInitTimer = jest.fn();
  const mockOnStopTimer = jest.fn();
  const taskTestID = "task-touchable";

  it("renders correctly", () => {
    const { getByText } = render(
      <Task
        task={mockTask}
        onPress={mockOnPress}
        disableTimer={mockDisableTimer}
        onInitTimer={() => mockOnInitTimer()}
        onStopTimer={() => mockOnStopTimer()}
        showTimedUntilNowOnTimer={mockTask.timed_until_now}
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
      />
    );

    const touchable = getByTestId(taskTestID);

    fireEvent.press(touchable);
    expect(mockOnPress).toHaveBeenCalled();
  });
});
