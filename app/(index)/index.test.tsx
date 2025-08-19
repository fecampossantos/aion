import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Home from "./index";

// Mock dependencies
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock("expo-sqlite", () => ({
  useSQLiteContext: jest.fn(),
}));

jest.mock("@expo/vector-icons", () => ({
  Entypo: ({ name, size, color, ...props }) => {
    const { Text } = require("react-native");
    return <Text testID={`entypo-${name}`} {...props}>{name}</Text>;
  },
}));

jest.mock("../../components/ProjectCard", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return ({ project }) => (
    <Text testID="project-card">{project.name}</Text>
  );
});

jest.mock("../../components/LoadingView", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return () => <Text testID="loading-view">Loading...</Text>;
});

describe("Home Screen", () => {
  const mockDatabase = {
    getAllAsync: jest.fn(),
  };

  const mockProjects = [
    {
      project_id: 1,
      name: "Project 1",
      hourly_cost: 50.0,
      created_at: new Date("2023-12-01"),
    },
    {
      project_id: 2,
      name: "Project 2",
      hourly_cost: 75.0,
      created_at: new Date("2023-12-02"),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    require("expo-sqlite").useSQLiteContext.mockReturnValue(mockDatabase);
    mockDatabase.getAllAsync.mockResolvedValue(mockProjects);
  });

  it("renders correctly with header", async () => {
    const { getByText } = render(<Home />);

    expect(getByText("Chrono")).toBeDefined();
  });

  it("displays projects after loading", async () => {
    const { getByText, queryByTestId } = render(<Home />);

    await waitFor(() => {
      expect(queryByTestId("loading-view")).toBeNull();
    });

    expect(getByText("Projetos")).toBeDefined();
    expect(getByText("Project 1")).toBeDefined();
    expect(getByText("Project 2")).toBeDefined();
  });

  it("displays empty state when no projects exist", async () => {
    mockDatabase.getAllAsync.mockResolvedValue([]);
    
    const { getByText, queryByTestId } = render(<Home />);

    await waitFor(() => {
      expect(queryByTestId("loading-view")).toBeNull();
    });

    expect(getByText("Você ainda não tem projetos.")).toBeDefined();
  });

  it("renders add button", () => {
    const { getByTestId } = render(<Home />);

    const addIcon = getByTestId("entypo-plus");
    expect(addIcon).toBeDefined();
  });

  it("navigates to AddProject when add button is pressed", async () => {
    const { getByTestId, queryByTestId } = render(<Home />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(queryByTestId("loading-view")).toBeNull();
    });

    const addIcon = getByTestId("entypo-plus");
    fireEvent.press(addIcon.parent);

    expect(require("expo-router").router.push).toHaveBeenCalledWith("AddProject");
  });

  it("fetches projects from database on mount", () => {
    render(<Home />);

    expect(mockDatabase.getAllAsync).toHaveBeenCalledWith("SELECT * FROM projects;");
  });

  it("renders correct number of project cards", async () => {
    const { getAllByTestId, queryByTestId } = render(<Home />);

    await waitFor(() => {
      expect(queryByTestId("loading-view")).toBeNull();
    });

    const projectCards = getAllByTestId("project-card");
    expect(projectCards).toHaveLength(2);
  });
});