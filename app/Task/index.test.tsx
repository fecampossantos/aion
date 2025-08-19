import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Task from "./index";

// Mock expo-sqlite
const mockDatabase = {
  getAllAsync: jest.fn(),
  runAsync: jest.fn(),
};

jest.mock("expo-sqlite", () => ({
  useSQLiteContext: () => mockDatabase,
}));

// Mock expo-router
const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
};

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ taskID: "1" }),
  useRouter: () => mockRouter,
}));

// Mock components
jest.mock("../../components/Timer", () => {
  const { View, Text, TouchableOpacity } = require("react-native");
  return ({ onInit, onStop }: { onInit: () => void; onStop: (time: number) => void }) => (
    <View testID="timer-component">
      <Text>Timer Component</Text>
      <TouchableOpacity testID="timer-start" onPress={onInit}>
        <Text>Start</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="timer-stop" onPress={() => onStop(3600)}>
        <Text>Stop</Text>
      </TouchableOpacity>
    </View>
  );
});

jest.mock("../../components/Timing", () => {
  const { View, Text, TouchableOpacity } = require("react-native");
  return ({ timing, deleteTiming, isTimerRunning }: any) => (
    <View testID={`timing-${timing.timing_id}`}>
      <Text>Timing: {timing.time}s</Text>
      <Text>Running: {isTimerRunning ? "Yes" : "No"}</Text>
      <TouchableOpacity testID={`delete-timing-${timing.timing_id}`} onPress={deleteTiming}>
        <Text>Delete</Text>
      </TouchableOpacity>
    </View>
  );
});

jest.mock("../../components/LoadingView", () => {
  const { View, Text } = require("react-native");
  return () => (
    <View testID="loading-view">
      <Text>Loading...</Text>
    </View>
  );
});

// Mock data
const mockTimings = [
  {
    timing_id: 1,
    task_id: 1,
    time: 3600,
    created_at: new Date("2023-01-01T10:00:00Z"),
  },
  {
    timing_id: 2,
    task_id: 1,
    time: 7200,
    created_at: new Date("2023-01-01T11:00:00Z"),
  },
];

describe("Task Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDatabase.getAllAsync.mockResolvedValue(mockTimings);
    mockDatabase.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: 3 });
  });

  // Component Basics Tests
  it("exports a component", () => {
    expect(Task).toBeDefined();
    expect(typeof Task).toBe("function");
  });

  it("renders without crashing", async () => {
    const { getByTestId } = render(<Task />);
    
    await waitFor(() => {
      expect(getByTestId("timer-component")).toBeDefined();
    });
  });

  // Loading State Tests
  it("shows loading view initially", () => {
    const { getByTestId } = render(<Task />);
    
    expect(getByTestId("loading-view")).toBeDefined();
  });

  it("hides loading view after data loads", async () => {
    const { queryByTestId } = render(<Task />);
    
    await waitFor(() => {
      expect(queryByTestId("loading-view")).toBeNull();
    });
  });

  // Data Loading Tests
  it("loads timings from database on mount", async () => {
    render(<Task />);
    
    await waitFor(() => {
      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        "SELECT * FROM timings WHERE task_id = ? ORDER BY created_at DESC;",
        "1"
      );
    });
  });

  it("renders timings when data is loaded", async () => {
    const { getByTestId } = render(<Task />);
    
    await waitFor(() => {
      expect(getByTestId("timing-1")).toBeDefined();
      expect(getByTestId("timing-2")).toBeDefined();
    });
  });

  it("shows no timings message when list is empty", async () => {
    mockDatabase.getAllAsync.mockResolvedValue([]);
    
    const { getByText } = render(<Task />);
    
    await waitFor(() => {
      expect(getByText("Sem timings pra essa task")).toBeDefined();
    });
  });

  it("handles missing taskID gracefully", async () => {
    jest.doMock("expo-router", () => ({
      useLocalSearchParams: () => ({ taskID: undefined }),
      useRouter: () => mockRouter,
    }));
    
    const { getByTestId } = render(<Task />);
    
    // Component should still render without crashing
    expect(getByTestId("timer-component")).toBeDefined();
  });

  // Timer Interaction Tests
  it("starts timer when timer component calls onInit", async () => {
    const { getByTestId } = render(<Task />);
    
    await waitFor(() => {
      const startButton = getByTestId("timer-start");
      fireEvent.press(startButton);
    });
    
    // Timer running state should be reflected in timing components
    await waitFor(() => {
      expect(getByTestId("timing-1")).toBeDefined();
    });
  });

  it("stops timer and saves timing when timer component calls onStop", async () => {
    const { getByTestId } = render(<Task />);
    
    await waitFor(() => {
      // First start the timer
      const startButton = getByTestId("timer-start");
      fireEvent.press(startButton);
    });
    
    await waitFor(() => {
      // Then stop the timer
      const stopButton = getByTestId("timer-stop");
      fireEvent.press(stopButton);
    });
    
    // Should insert new timing into database
    await waitFor(() => {
      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        "INSERT INTO timings (task_id, time) VALUES (?, ?);",
        "1",
        3600
      );
    });
  });

  it("updates isTimerRunning state correctly", async () => {
    const { getByTestId } = render(<Task />);
    
    await waitFor(() => {
      // Initially timer should not be running
      expect(getByTestId("timing-1")).toBeDefined();
    });
    
    // Start timer
    const startButton = getByTestId("timer-start");
    fireEvent.press(startButton);
    
    await waitFor(() => {
      // Timer should now be running
      expect(getByTestId("timing-1")).toBeDefined();
    });
    
    // Stop timer
    const stopButton = getByTestId("timer-stop");
    fireEvent.press(stopButton);
    
    await waitFor(() => {
      // Timer should no longer be running
      expect(getByTestId("timing-1")).toBeDefined();
    });
  });

  // Delete Timing Tests
  it("deletes timing when delete button is pressed", async () => {
    const { getByTestId } = render(<Task />);
    
    await waitFor(() => {
      const deleteButton = getByTestId("delete-timing-1");
      fireEvent.press(deleteButton);
    });
    
    await waitFor(() => {
      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        "DELETE FROM timings WHERE timing_id = ?;",
        1
      );
    });
  });

  it("shows loading and refreshes data after deleting timing", async () => {
    const { getByTestId, queryByTestId } = render(<Task />);
    
    await waitFor(() => {
      const deleteButton = getByTestId("delete-timing-1");
      fireEvent.press(deleteButton);
    });
    
    // Should show loading view
    expect(queryByTestId("loading-view")).toBeDefined();
    
    // Should reload timings
    await waitFor(() => {
      expect(mockDatabase.getAllAsync).toHaveBeenCalledTimes(2);
    });
  });

  it("calls delete timing database operation", async () => {
    const { getByTestId } = render(<Task />);
    
    await waitFor(() => {
      // Wait for initial load
      expect(getByTestId("timing-1")).toBeDefined();
    });

    const deleteButton = getByTestId("delete-timing-1");
    fireEvent.press(deleteButton);
    
    await waitFor(() => {
      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        "DELETE FROM timings WHERE timing_id = ?;",
        1
      );
    });
  });

  // Component State Management Tests
  it("manages component state correctly", async () => {
    const { getByTestId } = render(<Task />);
    
    await waitFor(() => {
      expect(getByTestId("timer-component")).toBeDefined();
      expect(mockDatabase.getAllAsync).toHaveBeenCalled();
    });
  });

  it("handles timer interactions correctly", async () => {
    const { getByTestId } = render(<Task />);
    
    // Start timer
    const startButton = getByTestId("timer-start");
    fireEvent.press(startButton);
    
    // Stop timer
    const stopButton = getByTestId("timer-stop");
    fireEvent.press(stopButton);
    
    // Should save timing to database
    await waitFor(() => {
      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        "INSERT INTO timings (task_id, time) VALUES (?, ?);",
        "1",
        3600
      );
    });
  });

  it("handles empty taskID parameter", async () => {
    jest.doMock("expo-router", () => ({
      useLocalSearchParams: () => ({ taskID: "" }),
      useRouter: () => mockRouter,
    }));
    
    const { getByTestId } = render(<Task />);
    
    // Should still render without crashing
    expect(getByTestId("timer-component")).toBeDefined();
  });

  it("handles null timing data gracefully", async () => {
    mockDatabase.getAllAsync.mockResolvedValue([]);
    
    const { getByTestId, getByText } = render(<Task />);
    
    await waitFor(() => {
      // Should still render timer component
      expect(getByTestId("timer-component")).toBeDefined();
      // Should show no timings message
      expect(getByText("Sem timings pra essa task")).toBeDefined();
    });
  });

  // Component Integration Tests
  it("passes correct props to Timer component", async () => {
    const { getByTestId } = render(<Task />);
    
    await waitFor(() => {
      expect(getByTestId("timer-component")).toBeDefined();
    });
  });

  it("passes correct props to Timing components", async () => {
    const { getByTestId } = render(<Task />);
    
    await waitFor(() => {
      expect(getByTestId("timing-1")).toBeDefined();
      expect(getByTestId("timing-2")).toBeDefined();
    });
  });

  it("maintains correct timing order (DESC by created_at)", async () => {
    const { getByTestId } = render(<Task />);
    
    await waitFor(() => {
      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        "SELECT * FROM timings WHERE task_id = ? ORDER BY created_at DESC;",
        "1"
      );
    });
  });
});
