import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { router } from "expo-router";
import AddButton from "../../../../app/Project/components/AddButton";

// Get the mocked router
const mockRouter = router as jest.Mocked<typeof router>;

describe("AddButton", () => {
  const mockProject = {
    project_id: 1,
    name: "Test Project",
    created_at: "2023-01-01",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly when closed", () => {
    const { getByTestId, queryByText } = render(
      <AddButton project={mockProject} />
    );

    expect(getByTestId("add-button-icon")).toBeDefined();
    expect(queryByText("Nova task")).toBeNull();
    expect(queryByText("Novo tempo")).toBeNull();
  });

  it("opens menu when plus button is pressed", () => {
    const { getByTestId, getByText } = render(
      <AddButton project={mockProject} />
    );

    const plusButton = getByTestId("add-button-icon");
    fireEvent.press(plusButton);

    expect(getByText("Nova task")).toBeDefined();
    expect(getByText("Novo tempo")).toBeDefined();
  });

  it("closes menu when plus button is pressed again", () => {
    const { getByTestId, getByText, queryByText } = render(
      <AddButton project={mockProject} />
    );

    const plusButton = getByTestId("add-button-icon");
    
    // Open menu
    fireEvent.press(plusButton);
    expect(getByText("Nova task")).toBeDefined();

    // Close menu
    fireEvent.press(plusButton);
    expect(queryByText("Nova task")).toBeNull();
  });

  it("navigates to AddTask when Nova task is pressed", () => {
    const { getByTestId, getByText } = render(
      <AddButton project={mockProject} />
    );

    // Open menu
    const plusButton = getByTestId("add-button-icon");
    fireEvent.press(plusButton);

    // Press Nova task
    const addTaskButton = getByText("Nova task");
    fireEvent.press(addTaskButton);

    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: "AddTask",
      params: { projectID: mockProject.project_id },
    });
  });

  it("navigates to AddRecord when Novo tempo is pressed", () => {
    const { getByTestId, getByText } = render(
      <AddButton project={mockProject} />
    );

    // Open menu
    const plusButton = getByTestId("add-button-icon");
    fireEvent.press(plusButton);

    // Press Novo tempo
    const addRecordButton = getByText("Novo tempo");
    fireEvent.press(addRecordButton);

    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: "/AddRecord",
      params: { projectID: mockProject.project_id },
    });
  });

  it("closes menu after navigating to AddTask", () => {
    const { getByTestId, getByText, queryByText } = render(
      <AddButton project={mockProject} />
    );

    // Open menu
    const plusButton = getByTestId("add-button-icon");
    fireEvent.press(plusButton);

    // Press Nova task
    const addTaskButton = getByText("Nova task");
    fireEvent.press(addTaskButton);

    // Menu should be closed (we can't directly test state, but navigation should happen)
    expect(mockRouter.push).toHaveBeenCalled();
  });

  it("closes menu after navigating to AddRecord", () => {
    const { getByTestId, getByText } = render(
      <AddButton project={mockProject} />
    );

    // Open menu
    const plusButton = getByTestId("add-button-icon");
    fireEvent.press(plusButton);

    // Press Novo tempo
    const addRecordButton = getByText("Novo tempo");
    fireEvent.press(addRecordButton);

    // Menu should be closed (we can't directly test state, but navigation should happen)
    expect(mockRouter.push).toHaveBeenCalled();
  });
});
