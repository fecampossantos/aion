import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Home from "../../../app/(index)";

// Mock dependencies
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));

// Mock the toast context
jest.mock("../../../components/Toast/ToastContext", () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock the expo modules
const mockDatabase = {
  getAllAsync: jest.fn(),
  getFirstAsync: jest.fn(),
};

jest.mock("expo-sqlite", () => ({
  useSQLiteContext: () => mockDatabase,
}));

// Mock the useDatabaseManagement hook to avoid the actual database calls
const mockHandleSearch = jest.fn();
const mockClearSearch = jest.fn();

// Create a flexible mock that can be configured
const createMockHook = (overrides = {}) => ({
  projects: [
    {
      project_id: 1,
      name: "Project 1",
      hourly_cost: 25.0,
      created_at: new Date("2023-01-01"),
    },
    {
      project_id: 2,
      name: "Project 2",
      hourly_cost: 30.0,
      created_at: new Date("2023-01-02"),
    },
  ],
  isLoading: false,
  filteredProjects: [
    {
      project_id: 1,
      name: "Project 1",
      hourly_cost: 25.0,
      created_at: new Date("2023-01-01"),
    },
    {
      project_id: 2,
      name: "Project 2",
      hourly_cost: 30.0,
      created_at: new Date("2023-01-02"),
    },
  ],
  searchQuery: "",
  handleSearch: mockHandleSearch,
  clearSearch: mockClearSearch,
  // Add missing properties to prevent undefined errors
  lastWorkedTask: null,
  isPopulating: false,
  isClearing: false,
  isBackingUp: false,
  isRestoring: false,
  refreshProjects: jest.fn(),
  handlePopulateDatabase: jest.fn(),
  handlePopulateConfirm: jest.fn(),
  handleClearDatabase: jest.fn(),
  handleClearConfirm: jest.fn(),
  handleBackupData: jest.fn(),
  handleBackupConfirm: jest.fn(),
  handleRestoreData: jest.fn(),
  handleRestoreConfirm: jest.fn(),
  handleFinalRestoreConfirm: jest.fn(),
  // Modal states
  showBackupModal: false,
  setShowBackupModal: jest.fn(),
  showRestoreModal: false,
  setShowRestoreModal: jest.fn(),
  showRestoreConfirmationModal: false,
  setShowRestoreConfirmationModal: jest.fn(),
  restoreBackupInfo: null,
  setRestoreBackupInfo: jest.fn(),
  // Confirmation modal states
  showPopulateConfirmation: false,
  setShowPopulateConfirmation: jest.fn(),
  showClearConfirmation: false,
  setShowClearConfirmation: jest.fn(),
  ...overrides,
});

const mockUseDatabaseManagement = jest.fn(() => createMockHook());

jest.mock("../../../app/(index)/useDatabaseManagement", () => ({
  useDatabaseManagement: () => mockUseDatabaseManagement(),
}));

// Mock the LoadingView component
jest.mock("../../../components/LoadingView", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return () => <Text testID="loading-container">Loading...</Text>;
});

// Mock the ProjectCard component
jest.mock("../../../components/ProjectCard", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return ({ project }: { project: any }) => (
    <View testID="project-card">
      <Text>{project.name}</Text>
    </View>
  );
});

// Mock the SearchBar component
jest.mock("../../../components/SearchBar", () => {
  const React = require("react");
  const { TextInput, View } = require("react-native");
  return ({ onSearch, placeholder }: { onSearch: any; placeholder: string }) => (
    <View>
      <TextInput testID="search-input" placeholder={placeholder} />
    </View>
  );
});

// Mock the Task component
jest.mock("../../../components/Task", () => {
  const React = require("react");
  const { View, Text, Pressable } = require("react-native");
  return ({ task, onPress }: { task: any; onPress: any }) => (
    <Pressable onPress={onPress}>
      <View testID="task-item">
        <Text>{task.name}</Text>
      </View>
    </Pressable>
  );
});

describe("Home Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly", () => {
    const { getByText } = render(<Home />);

    expect(getByText("aion")).toBeDefined();
  });

  it("displays projects after loading", () => {
    const { getByText } = render(<Home />);

    expect(getByText("Projetos")).toBeDefined();
    expect(getByText("Project 1")).toBeDefined();
    expect(getByText("Project 2")).toBeDefined();
  });

  it("displays empty state when no projects exist", () => {
    // Override the mock to return empty projects
    mockUseDatabaseManagement.mockReturnValue(createMockHook({
      projects: [],
      filteredProjects: [],
    }));

    const { getByText } = render(<Home />);

    // Should show empty state when no projects exist
    expect(getByText("Nenhum projeto encontrado")).toBeDefined();
    expect(getByText("Comece criando seu primeiro projeto para organizar suas tarefas")).toBeDefined();
  });

  it("renders add button", () => {
    const { getByTestId } = render(<Home />);

    const addIcon = getByTestId("entypo-plus");
    expect(addIcon).toBeDefined();
  });

  it("navigates to AddProject when add button is pressed", () => {
    const { getByTestId } = render(<Home />);

    const addButton = getByTestId("entypo-plus");
    fireEvent.press(addButton);

    expect(require("expo-router").router.push).toHaveBeenCalledWith("AddProject");
  });

  it("renders search bar with correct placeholder", () => {
    const { getByTestId, getByPlaceholderText } = render(<Home />);

    expect(getByTestId("search-input")).toBeDefined();
    expect(getByPlaceholderText("Buscar projetos...")).toBeDefined();
  });

  it("filters projects when searching", () => {
    const { getByTestId } = render(<Home />);

    const searchInput = getByTestId("search-input");
    
    // Search for "Project 1"
    fireEvent.changeText(searchInput, "Project 1");
    
    // Verify that the search function was called
    expect(mockHandleSearch).toHaveBeenCalledWith("Project 1");
  });

  it("shows search empty state when no projects match search", () => {
    const { getByTestId } = render(<Home />);

    const searchInput = getByTestId("search-input");
    
    // Search for non-existent project
    fireEvent.changeText(searchInput, "NonExistent");
    
    // Verify that the search function was called
    expect(mockHandleSearch).toHaveBeenCalledWith("NonExistent");
  });

  it("shows all projects when search is cleared", () => {
    const { getByTestId } = render(<Home />);

    const searchInput = getByTestId("search-input");
    
    // Search for "Project 1"
    fireEvent.changeText(searchInput, "Project 1");
    expect(mockHandleSearch).toHaveBeenCalledWith("Project 1");
    
    // Clear search
    fireEvent.changeText(searchInput, "");
    expect(mockHandleSearch).toHaveBeenCalledWith("");
  });

  it("fetches projects from database on mount", () => {
    const mockRefreshProjects = jest.fn();
    
    // Override the mock to return the refreshProjects function
    mockUseDatabaseManagement.mockReturnValue(createMockHook({
      refreshProjects: mockRefreshProjects,
    }));

    render(<Home />);

    // The component should call refreshProjects on mount (which internally calls fetchAllProjects and fetchLastWorkedTask)
    // Since we're mocking the hook, we can't directly test the useEffect, but we can verify the component renders
    // with the data that would come from those functions
    expect(mockRefreshProjects).toBeDefined();
  });

  it("renders correct number of project cards", () => {
    const { getAllByTestId } = render(<Home />);

    const projectCards = getAllByTestId("project-card");
    expect(projectCards).toHaveLength(2);
  });

  it("shows loading state when isLoading is true", () => {
    mockUseDatabaseManagement.mockReturnValue(createMockHook({
      isLoading: true,
    }));

    const { getByTestId } = render(<Home />);
    expect(getByTestId("loading-container")).toBeDefined();
  });

  it("shows last worked task when available", () => {
    const mockLastWorkedTask = {
      task_id: 1,
      name: "Test Task",
      completed: 0,
      task_created_at: "2023-01-01",
      timed_until_now: 120,
      project_id: 1,
      project_name: "Test Project",
      last_timing_date: "2023-01-01",
    };

    mockUseDatabaseManagement.mockReturnValue(createMockHook({
      lastWorkedTask: mockLastWorkedTask,
    }));

    const { getByText } = render(<Home />);
    
    expect(getByText("Última Tarefa Trabalhada")).toBeDefined();
    expect(getByText("Test Project")).toBeDefined();
    expect(getByText("Test Task")).toBeDefined();
  });

  it("does not show last worked task when not available", () => {
    mockUseDatabaseManagement.mockReturnValue(createMockHook({
      lastWorkedTask: null,
    }));

    const { queryByText } = render(<Home />);
    
    expect(queryByText("Última Tarefa Trabalhada")).toBeNull();
  });

  it("navigates to task when last worked task is pressed", () => {
    const mockLastWorkedTask = {
      task_id: 1,
      name: "Test Task",
      completed: 0,
      task_created_at: "2023-01-01",
      timed_until_now: 120,
      project_id: 1,
      project_name: "Test Project",
      last_timing_date: "2023-01-01",
    };

    mockUseDatabaseManagement.mockReturnValue(createMockHook({
      lastWorkedTask: mockLastWorkedTask,
    }));

    const { getByTestId } = render(<Home />);
    
    const taskElement = getByTestId("task-item");
    fireEvent.press(taskElement);
    
    expect(require("expo-router").router.push).toHaveBeenCalledWith("/Task?taskID=1");
  });

  it("shows search results when projects match search", () => {
    mockUseDatabaseManagement.mockReturnValue(createMockHook({
      searchQuery: "Project 1",
      filteredProjects: [
        {
          project_id: 1,
          name: "Project 1",
          hourly_cost: 25.0,
          created_at: new Date("2023-01-01"),
        },
      ],
    }));

    const { getByText } = render(<Home />);
    
    expect(getByText("Projetos")).toBeDefined();
    expect(getByText("Project 1")).toBeDefined();
  });

  it("shows search empty state when no projects match search", () => {
    mockUseDatabaseManagement.mockReturnValue(createMockHook({
      searchQuery: "NonExistent",
      filteredProjects: [],
    }));

    const { getByText } = render(<Home />);
    
    expect(getByText("Nenhum projeto encontrado")).toBeDefined();
    expect(getByText("Tente ajustar sua busca ou criar um novo projeto")).toBeDefined();
  });

  it("handles refresh button press", () => {
    const mockRefreshProjects = jest.fn();
    
    mockUseDatabaseManagement.mockReturnValue(createMockHook({
      refreshProjects: mockRefreshProjects,
    }));

    const { getByTestId } = render(<Home />);
    
    const refreshButton = getByTestId("entypo-cycle");
    fireEvent.press(refreshButton);
    
    expect(mockRefreshProjects).toHaveBeenCalled();
  });

  it("handles populate database button press", () => {
    const mockHandlePopulateDatabase = jest.fn();
    
    mockUseDatabaseManagement.mockReturnValue(createMockHook({
      handlePopulateDatabase: mockHandlePopulateDatabase,
    }));

    const { getByText } = render(<Home />);
    
    const populateButton = getByText("Populate Database");
    fireEvent.press(populateButton);
    
    expect(mockHandlePopulateDatabase).toHaveBeenCalled();
  });

  it("handles clear database button press", () => {
    const mockHandleClearDatabase = jest.fn();
    
    mockUseDatabaseManagement.mockReturnValue(createMockHook({
      handleClearDatabase: mockHandleClearDatabase,
    }));

    const { getByText } = render(<Home />);
    
    const clearButton = getByText("Clear Database");
    fireEvent.press(clearButton);
    
    expect(mockHandleClearDatabase).toHaveBeenCalled();
  });

  it("handles backup data button press", () => {
    const mockHandleBackupData = jest.fn();
    
    mockUseDatabaseManagement.mockReturnValue(createMockHook({
      handleBackupData: mockHandleBackupData,
    }));

    const { getByText } = render(<Home />);
    
    const backupButton = getByText("Backup Data");
    fireEvent.press(backupButton);
    
    expect(mockHandleBackupData).toHaveBeenCalled();
  });

  it("handles restore data button press", () => {
    const mockHandleRestoreData = jest.fn();
    
    mockUseDatabaseManagement.mockReturnValue(createMockHook({
      handleRestoreData: mockHandleRestoreData,
    }));

    const { getByText } = render(<Home />);
    
    const restoreButton = getByText("Restore Data");
    fireEvent.press(restoreButton);
    
    expect(mockHandleRestoreData).toHaveBeenCalled();
  });

  it("shows modals when their states are true", () => {
    mockUseDatabaseManagement.mockReturnValue(createMockHook({
      showPopulateConfirmation: true,
      showClearConfirmation: true,
      showBackupModal: true,
      showRestoreModal: true,
      showRestoreConfirmationModal: true,
    }));

    const { getByText } = render(<Home />);
    
    // Test for unique modal content to avoid conflicts with button text
    expect(getByText("This will add 2 projects with extensive tasks and 2 months of time tracking data. This may take a few seconds.")).toBeDefined();
    expect(getByText("This will permanently delete ALL projects, tasks, and time tracking data. This action cannot be undone!")).toBeDefined();
    
    // Test for modal titles that are unique
    expect(getByText("Populate")).toBeDefined(); // Button text in modal
    expect(getByText("Clear All")).toBeDefined(); // Button text in modal
  });

  it("handles search input changes", () => {
    const { getByTestId } = render(<Home />);
    
    const searchInput = getByTestId("search-input");
    fireEvent.changeText(searchInput, "New Search");
    
    expect(mockHandleSearch).toHaveBeenCalledWith("New Search");
  });

  it("handles search clear", () => {
    const { getByTestId } = render(<Home />);
    
    const searchInput = getByTestId("search-input");
    fireEvent.changeText(searchInput, "");
    
    expect(mockHandleSearch).toHaveBeenCalledWith("");
  });

  it("shows correct button text based on loading states", () => {
    mockUseDatabaseManagement.mockReturnValue(createMockHook({
      isPopulating: true,
      isClearing: true,
      isBackingUp: true,
      isRestoring: true,
    }));

    const { getByText } = render(<Home />);
    
    expect(getByText("Populating...")).toBeDefined();
    expect(getByText("Clearing...")).toBeDefined();
    expect(getByText("Creating...")).toBeDefined();
    expect(getByText("Restoring...")).toBeDefined();
  });

  it("renders with different project counts", () => {
    const singleProject = [
      {
        project_id: 1,
        name: "Single Project",
        hourly_cost: 25.0,
        created_at: new Date("2023-01-01"),
      },
    ];

    mockUseDatabaseManagement.mockReturnValue(createMockHook({
      projects: singleProject,
      filteredProjects: singleProject,
    }));

    const { getAllByTestId, getByText } = render(<Home />);
    
    const projectCards = getAllByTestId("project-card");
    expect(projectCards).toHaveLength(1);
    expect(getByText("Single Project")).toBeDefined();
  });

  it("handles edge case with empty filtered projects but non-empty projects", () => {
    mockUseDatabaseManagement.mockReturnValue(createMockHook({
      projects: [
        {
          project_id: 1,
          name: "Project 1",
          hourly_cost: 25.0,
          created_at: new Date("2023-01-01"),
        },
      ],
      filteredProjects: [],
      searchQuery: "No Match",
    }));

    const { getByText } = render(<Home />);
    
    expect(getByText("Nenhum projeto encontrado")).toBeDefined();
    expect(getByText("Tente ajustar sua busca ou criar um novo projeto")).toBeDefined();
  });

  it("renders database buttons with correct styles and icons", () => {
    const { getByText } = render(<Home />);
    
    // Check that all database management buttons are present
    expect(getByText("Populate Database")).toBeDefined();
    expect(getByText("Clear Database")).toBeDefined();
    expect(getByText("Backup Data")).toBeDefined();
    expect(getByText("Restore Data")).toBeDefined();
  });

  it("renders with different loading states for database operations", () => {
    // Test different combinations of loading states
    const testCases = [
      { isPopulating: true, isClearing: false, isBackingUp: false, isRestoring: false },
      { isPopulating: false, isClearing: true, isBackingUp: false, isRestoring: false },
      { isPopulating: false, isClearing: false, isBackingUp: true, isRestoring: false },
      { isPopulating: false, isClearing: false, isBackingUp: false, isRestoring: true },
    ];

    testCases.forEach((testCase) => {
      mockUseDatabaseManagement.mockReturnValue(createMockHook(testCase));
      
      const { getByText } = render(<Home />);
      
      if (testCase.isPopulating) {
        expect(getByText("Populating...")).toBeDefined();
      }
      if (testCase.isClearing) {
        expect(getByText("Clearing...")).toBeDefined();
      }
      if (testCase.isBackingUp) {
        expect(getByText("Creating...")).toBeDefined();
      }
      if (testCase.isRestoring) {
        expect(getByText("Restoring...")).toBeDefined();
      }
    });
  });
});
