import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import AddTask from "./index";

// Use the global mocks and override specific implementations
const mockDatabase = {
  getFirstAsync: jest.fn(),
  runAsync: jest.fn(),
};

const mockPush = jest.fn();

// Mock the modules directly
jest.mock("expo-sqlite", () => ({
  useSQLiteContext: () => mockDatabase,
}));

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
  useLocalSearchParams: () => ({ projectID: "1" }),
}));

// Get the mocked router
const { router } = require("expo-router");
const mockRouterPush = router.push as jest.Mock;

describe("AddTask", () => {
  const mockProject = {
    project_id: 1,
    name: "Test Project",
    hourly_cost: 25.0,
    created_at: new Date("2023-01-01"),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockDatabase.getFirstAsync.mockResolvedValue(mockProject);
    mockDatabase.runAsync.mockResolvedValue(undefined);
    mockRouterPush.mockClear();
  });

  it("renders correctly", async () => {
    const { getByPlaceholderText, getByText } = render(<AddTask />);

    await waitFor(() => {
      expect(getByPlaceholderText("Task")).toBeDefined();
      expect(getByText("Adicionar task")).toBeDefined();
    });
  });

  it("loads project data on mount", async () => {
    render(<AddTask />);

    await waitFor(() => {
      expect(mockDatabase.getFirstAsync).toHaveBeenCalledWith(
        "SELECT * FROM projects WHERE project_id = ?;",
        "1"
      );
    });
  });

  it("updates task name when user types", async () => {
    const { getByPlaceholderText } = render(<AddTask />);

    await waitFor(() => {
      const taskInput = getByPlaceholderText("Task");
      fireEvent.changeText(taskInput, "New Task");
      
      expect(taskInput.props.value).toBe("New Task");
    });
  });

  it("does not add task when name is empty", async () => {
    const { getByText } = render(<AddTask />);

    await waitFor(() => {
      const addButton = getByText("Adicionar task");
      fireEvent.press(addButton);
      
      // Should not call database insert when task name is empty
      expect(mockDatabase.runAsync).not.toHaveBeenCalled();
    });
  });

  it("adds task when name is provided", async () => {
    const { getByPlaceholderText, getByText } = render(<AddTask />);

    await waitFor(() => {
      // Wait for project to load
      expect(mockDatabase.getFirstAsync).toHaveBeenCalled();
    });

    // Type task name
    const taskInput = getByPlaceholderText("Task");
    fireEvent.changeText(taskInput, "Test Task");
    
    // Press add button
    const addButton = getByText("Adicionar task");
    fireEvent.press(addButton);
    
    await waitFor(() => {
      // Should call database insert
      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        "INSERT INTO tasks (project_id, name, completed) VALUES (?, ?, 0);",
        1,
        "Test Task"
      );
    });
  });

  it("navigates back to project after successful task addition", async () => {
    const { getByPlaceholderText, getByText } = render(<AddTask />);

    await waitFor(() => {
      // Wait for project to load
      expect(mockDatabase.getFirstAsync).toHaveBeenCalled();
    });

    // Type task name
    const taskInput = getByPlaceholderText("Task");
    fireEvent.changeText(taskInput, "Test Task");
    
    // Press add button
    const addButton = getByText("Adicionar task");
    fireEvent.press(addButton);
    
    await waitFor(() => {
      // Should navigate back to project
      expect(mockRouterPush).toHaveBeenCalledWith({
        pathname: "Project",
        params: { projectID: 1 },
      });
    });
  });

  it("validates task creation flow", async () => {
    const { getByPlaceholderText, getByText } = render(<AddTask />);

    await waitFor(() => {
      // Wait for project to load
      expect(mockDatabase.getFirstAsync).toHaveBeenCalled();
    });

    // Type task name
    const taskInput = getByPlaceholderText("Task");
    fireEvent.changeText(taskInput, "Test Task");
    
    // Press add button
    const addButton = getByText("Adicionar task");
    fireEvent.press(addButton);
    
    await waitFor(() => {
      // Should call database insert and navigation
      expect(mockDatabase.runAsync).toHaveBeenCalled();
      expect(mockRouterPush).toHaveBeenCalled();
    });
  });

  it("handles empty task name validation", async () => {
    const { getByPlaceholderText, getByText } = render(<AddTask />);

    await waitFor(() => {
      // Leave task name empty
      const taskInput = getByPlaceholderText("Task");
      fireEvent.changeText(taskInput, "");
      
      // Press add button
      const addButton = getByText("Adicionar task");
      fireEvent.press(addButton);
      
      // Should not call database operations
      expect(mockDatabase.runAsync).not.toHaveBeenCalled();
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });

  it("handles whitespace-only task names", async () => {
    const { getByPlaceholderText, getByText } = render(<AddTask />);

    await waitFor(() => {
      // Wait for project to load
      expect(mockDatabase.getFirstAsync).toHaveBeenCalled();
    });

    // Set task name to whitespace only
    const taskInput = getByPlaceholderText("Task");
    fireEvent.changeText(taskInput, "   ");
    
    // Press add button
    const addButton = getByText("Adicionar task");
    fireEvent.press(addButton);
    
    await waitFor(() => {
      // Should still add the task (current implementation doesn't trim)
      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        "INSERT INTO tasks (project_id, name, completed) VALUES (?, ?, 0);",
        1,
        "   "
      );
    });
  });

  it("displays the correct placeholder text", async () => {
    const { getByPlaceholderText } = render(<AddTask />);

    await waitFor(() => {
      const taskInput = getByPlaceholderText("Task");
      expect(taskInput).toBeDefined();
    });
  });

  it("displays the correct button text", async () => {
    const { getByText } = render(<AddTask />);

    await waitFor(() => {
      const addButton = getByText("Adicionar task");
      expect(addButton).toBeDefined();
    });
  });
});
