import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import EditProject from "./index";

// Mock implementations
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

describe("EditProject", () => {
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
    const { getByPlaceholderText, getByText } = render(<EditProject />);

    await waitFor(() => {
      expect(getByPlaceholderText("Nome do projeto")).toBeDefined();
      expect(getByPlaceholderText("00,00")).toBeDefined();
      expect(getByText("editar projeto")).toBeDefined();
      expect(getByText("Projeto")).toBeDefined();
      expect(getByText("Valor cobrado por hora")).toBeDefined();
    });
  });

  it("loads project data on mount", async () => {
    render(<EditProject />);

    await waitFor(() => {
      expect(mockDatabase.getFirstAsync).toHaveBeenCalledWith(
        "SELECT * FROM projects WHERE project_id = ?;",
        "1"
      );
    });
  });

  it("populates form fields with project data", async () => {
    const { getByPlaceholderText } = render(<EditProject />);

    await waitFor(() => {
      const nameInput = getByPlaceholderText("Nome do projeto");
      const costInput = getByPlaceholderText("00,00");
      
      expect(nameInput.props.value).toBe("Test Project");
      expect(costInput.props.value).toBe("25,00");
    });
  });

  it("updates project name when user types", async () => {
    const { getByPlaceholderText } = render(<EditProject />);

    await waitFor(() => {
      const nameInput = getByPlaceholderText("Nome do projeto");
      fireEvent.changeText(nameInput, "Updated Project Name");
      
      expect(nameInput.props.value).toBe("Updated Project Name");
    });
  });

  it("updates hourly cost when user types", async () => {
    const { getByPlaceholderText } = render(<EditProject />);

    await waitFor(() => {
      const costInput = getByPlaceholderText("00,00");
      fireEvent.changeText(costInput, "30,50");
      
      expect(costInput.props.value).toBe("30,50");
    });
  });

  it("shows error when project name is empty", async () => {
    const { getByPlaceholderText, getByText } = render(<EditProject />);

    await waitFor(() => {
      // Wait for project to load
      expect(mockDatabase.getFirstAsync).toHaveBeenCalled();
    });

    // Clear the project name
    const nameInput = getByPlaceholderText("Nome do projeto");
    fireEvent.changeText(nameInput, "");
    
    // Press edit button
    const editButton = getByText("editar projeto");
    fireEvent.press(editButton);
    
    await waitFor(() => {
      expect(getByText("O nome do projeto nao pode estar vazio")).toBeDefined();
    });
  });

  it("shows error when project name already exists", async () => {
    mockDatabase.getFirstAsync
      .mockResolvedValueOnce(mockProject) // First call for loading project
      .mockResolvedValueOnce({ project_id: 2, name: "Existing Project" }); // Second call for duplicate check

    const { getByPlaceholderText, getByText } = render(<EditProject />);

    await waitFor(() => {
      // Wait for project to load
      expect(mockDatabase.getFirstAsync).toHaveBeenCalled();
    });

    // Change project name to existing one
    const nameInput = getByPlaceholderText("Nome do projeto");
    fireEvent.changeText(nameInput, "Existing Project");
    
    // Press edit button
    const editButton = getByText("editar projeto");
    fireEvent.press(editButton);
    
    await waitFor(() => {
      expect(getByText("Um projeto com esse nome já existe")).toBeDefined();
    });
  });

  it("clears error message when project name changes", async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<EditProject />);

    await waitFor(() => {
      // Wait for project to load
      expect(mockDatabase.getFirstAsync).toHaveBeenCalled();
    });

    // First, trigger an error
    const nameInput = getByPlaceholderText("Nome do projeto");
    fireEvent.changeText(nameInput, "");
    
    const editButton = getByText("editar projeto");
    fireEvent.press(editButton);
    
    await waitFor(() => {
      expect(getByText("O nome do projeto nao pode estar vazio")).toBeDefined();
    });

    // Now change the name to clear the error
    fireEvent.changeText(nameInput, "New Name");
    
    await waitFor(() => {
      expect(queryByText("O nome do projeto nao pode estar vazio")).toBeNull();
    });
  });

    it("calls handleEditProject when button is pressed", async () => {
    const { getByText } = render(<EditProject />);

    await waitFor(() => {
      // Wait for project to load
      expect(mockDatabase.getFirstAsync).toHaveBeenCalled();
    });

    // Press edit button without making changes
    const editButton = getByText("editar projeto");
    fireEvent.press(editButton);
    
    // Should always navigate to home, regardless of changes
    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith("/");
    });
  });

  it("navigates to home after button press", async () => {
    // Mock the duplicate check to return null (no duplicate)
    mockDatabase.getFirstAsync
      .mockResolvedValueOnce(mockProject) // First call for loading project
      .mockResolvedValueOnce(null); // Second call for duplicate check

    const { getByPlaceholderText, getByText } = render(<EditProject />);

    await waitFor(() => {
      // Wait for project to load
      expect(mockDatabase.getFirstAsync).toHaveBeenCalled();
    });

    // Update project name
    const nameInput = getByPlaceholderText("Nome do projeto");
    fireEvent.changeText(nameInput, "Updated Project");
    
    // Press edit button
    const editButton = getByText("editar projeto");
    fireEvent.press(editButton);
    
    await waitFor(() => {
      // Should navigate to home
      expect(mockRouterPush).toHaveBeenCalledWith("/");
    });
  });

  it("handles empty hourly cost by setting default value", async () => {
    const { getByPlaceholderText, getByText } = render(<EditProject />);

    await waitFor(() => {
      // Wait for project to load
      expect(mockDatabase.getFirstAsync).toHaveBeenCalled();
    });

    // Clear hourly cost
    const costInput = getByPlaceholderText("00,00");
    fireEvent.changeText(costInput, "");
    
    // Press edit button
    const editButton = getByText("editar projeto");
    fireEvent.press(editButton);
    
    await waitFor(() => {
      // Should call database update with default cost
      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        "UPDATE projects SET name = ?, hourly_cost = ? WHERE project_id = ?;",
        "Test Project",
        0.0,
        1
      );
    });
  });

  it("does not update when no changes are made", async () => {
    const { getByPlaceholderText, getByText } = render(<EditProject />);

    await waitFor(() => {
      // Wait for project to load
      expect(mockDatabase.getFirstAsync).toHaveBeenCalled();
    });

    // Keep the same project name and cost
    const nameInput = getByPlaceholderText("Nome do projeto");
    const costInput = getByPlaceholderText("00,00");
    expect(nameInput.props.value).toBe("Test Project");
    expect(costInput.props.value).toBe("25,00");
    
    // Press edit button
    const editButton = getByText("editar projeto");
    fireEvent.press(editButton);
    
    await waitFor(() => {
      // Should not call database update when no changes are made
      expect(mockDatabase.runAsync).not.toHaveBeenCalled();
    });
  });

  it("handles button press without throwing errors", async () => {
    const { getByText } = render(<EditProject />);

    await waitFor(() => {
      // Wait for project to load
      expect(mockDatabase.getFirstAsync).toHaveBeenCalled();
    });

    // Press edit button
    const editButton = getByText("editar projeto");
    
    // Should not throw when pressing the button
    expect(() => fireEvent.press(editButton)).not.toThrow();
    
    await waitFor(() => {
      // Should navigate to home
      expect(mockRouterPush).toHaveBeenCalledWith("/");
    });
  });

  it("handles null project gracefully", async () => {
    mockDatabase.getFirstAsync.mockResolvedValue(null);
    
    const { queryByText } = render(<EditProject />);

    await waitFor(() => {
      // Wait for database call
      expect(mockDatabase.getFirstAsync).toHaveBeenCalled();
    });

    // Component should not render anything when project is null
    expect(queryByText("Projeto")).toBeNull();
  });

  it("formats hourly cost correctly for display", async () => {
    const { getByPlaceholderText } = render(<EditProject />);

    await waitFor(() => {
      // Wait for project to load
      expect(mockDatabase.getFirstAsync).toHaveBeenCalled();
    });

    // Check that hourly cost is formatted with comma and two decimal places
    const costInput = getByPlaceholderText("00,00");
    expect(costInput.props.value).toBe("25,00");
  });

  it("parses hourly cost correctly for database update", async () => {
    const { getByPlaceholderText, getByText } = render(<EditProject />);

    await waitFor(() => {
      // Wait for project to load
      expect(mockDatabase.getFirstAsync).toHaveBeenCalled();
    });

    // Set hourly cost with comma
    const costInput = getByPlaceholderText("00,00");
    fireEvent.changeText(costInput, "45,75");
    
    // Press edit button
    const editButton = getByText("editar projeto");
    fireEvent.press(editButton);
    
    await waitFor(() => {
      // Should parse comma-formatted cost to float
      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        "UPDATE projects SET name = ?, hourly_cost = ? WHERE project_id = ?;",
        "Test Project",
        45.75,
        1
      );
    });
  });
});
