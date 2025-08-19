import React from "react";
import { render, fireEvent } from "@testing-library/react-native";

import ProjectCard from "./index";
import { Project } from "../../interfaces/Project";

// Mock the router
const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("<ProjectCard />", () => {
  const mockProject: Project = {
    project_id: 1,
    name: "mocked project",
    hourly_cost: 50,
    created_at: new Date(),
  };

  const testID = "projectCard-touchable";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly", () => {
    const { getByText } = render(
      <ProjectCard project={mockProject} />
    );
    const projectName = getByText(mockProject.name);
    expect(projectName).toBeDefined();
  });

  it("calls router push when pressed", () => {
    const { getByTestId } = render(
      <ProjectCard project={mockProject} />
    );

    const touchable = getByTestId(testID);

    fireEvent.press(touchable);
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "Project",
      params: { projectID: mockProject.project_id },
    });
  });
});
