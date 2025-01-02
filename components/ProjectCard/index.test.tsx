import React from "react";

import { render, fireEvent } from "@testing-library/react-native";

import ProjectCard from "./index";
import { Project } from "../../interfaces/Project";

describe("<ProjectCard />", () => {
  const mockProject: Project = {
    project_id: 1,
    name: "mocked project",
    hourly_cost: 50,
    created_at: new Date(),
  };

  const mockNavigation = {
    navigate: jest.fn(),
  };

  const testID = "projectCard-touchable";

  it("renders correctly", () => {
    const { getByText } = render(
      <ProjectCard project={mockProject} navigation={mockNavigation} />
    );
    const projectName = getByText(mockProject.name);
    expect(projectName).toBeDefined();
  });

  it("calls navigation when pressed", () => {
    const { getByTestId } = render(
      <ProjectCard project={mockProject} navigation={mockNavigation} />
    );

    const touchable = getByTestId(testID);

    fireEvent.press(touchable);
    expect(mockNavigation.navigate).toHaveBeenCalledWith("Project", {
      project: mockProject,
    });
  });
});
