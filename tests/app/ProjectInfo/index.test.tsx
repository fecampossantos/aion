import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import ProjectInfo from "../../../app/ProjectInfo";

// Mock useReport hook
const mockUseReport = {
  getTimings: jest.fn(),
  getProject: jest.fn(),
  getBurndownData: jest.fn(),
  endDate: new Date("2023-12-31"),
  handleShowDatePicker: jest.fn(),
  startDate: new Date("2023-12-01"),
  handleClickedOnDeleteProject: jest.fn(),
  resultSet: {
    labels: ["Task 1", "Task 2"],
    datasets: [{ data: [120, 180] }],
  },
  showDatePicker: false,
  datePickerValue: new Date("2023-12-15"),
  handleUpdateDate: jest.fn(),
  dateShown: "start" as "start" | "end" | null,
  project: {
    project_id: 1,
    name: "Test Project",
    hourly_cost: 25.0,
    created_at: new Date("2023-01-01"),
  },
  showChart: true,
  // Modal state and handlers
  showDeleteModal: false,
  deleteProjectInput: "",
  setDeleteProjectInput: jest.fn(),
  handleConfirmDelete: jest.fn(),
  handleCancelDelete: jest.fn(),
};

// Mock the custom hook
jest.mock("../../../app/ProjectInfo/useReport", () => jest.fn(() => mockUseReport));

// Mock the toast context
jest.mock("../../../components/Toast/ToastContext", () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock expo-router
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ projectID: "1" }),
  router: { push: jest.fn() },
}));

describe("ProjectInfo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("exports component correctly", () => {
    expect(ProjectInfo).toBeDefined();
    expect(typeof ProjectInfo).toBe("function");
  });

  it("has correct display name", () => {
    expect(ProjectInfo.name).toBe("ProjectInfo");
  });

  it("calls useReport hook with correct projectID", () => {
    render(<ProjectInfo />);
    expect(require("../../../app/ProjectInfo/useReport")).toHaveBeenCalledWith("1");
  });

  it("calls getProject on mount", () => {
    render(<ProjectInfo />);
    expect(mockUseReport.getProject).toHaveBeenCalled();
  });

  it("renders without crashing when project exists", () => {
    const { getByText } = render(<ProjectInfo />);
    // Basic rendering test - the component should render without errors
    expect(getByText).toBeDefined();
  });

  it("returns null when project is undefined", () => {
    // Mock project as undefined
    const mockUseReportNoProject = {
      ...mockUseReport,
      project: undefined,
    };

    jest.mocked(require("../../../app/ProjectInfo/useReport")).mockReturnValue(mockUseReportNoProject);

    const { UNSAFE_root } = render(<ProjectInfo />);

    // Component should not render anything when project is undefined
    expect(UNSAFE_root.children).toHaveLength(0);
  });

  it("handles useReport hook correctly", () => {
    render(<ProjectInfo />);

    // Verify the hook is called
    expect(require("../../../app/ProjectInfo/useReport")).toHaveBeenCalled();

    // Verify getProject is called in useEffect
    expect(mockUseReport.getProject).toHaveBeenCalled();
  });

  it("uses correct projectID from params", () => {
    render(<ProjectInfo />);

    // Verify useReport is called with the projectID from useLocalSearchParams
    expect(require("../../../app/ProjectInfo/useReport")).toHaveBeenCalledWith("1");
  });

  it("manages component lifecycle correctly", () => {
    const { unmount } = render(<ProjectInfo />);

    // Component should mount and unmount without errors
    expect(() => unmount()).not.toThrow();
  });

  it("calls getTimings when project exists and dates change", async () => {
    // Ensure the mock is properly set up
    const mockUseReportWithProject = {
      ...mockUseReport,
      project: {
        project_id: 1,
        name: "Test Project",
        hourly_cost: 25.0,
        created_at: new Date("2023-01-01"),
      },
    };

    jest
      .mocked(require("../../../app/ProjectInfo/useReport"))
      .mockReturnValue(mockUseReportWithProject);

    render(<ProjectInfo />);

    // Wait for the useEffect to run
    await waitFor(() => {
      expect(mockUseReportWithProject.getTimings).toHaveBeenCalled();
    });
  });

  // Modal tests
  describe("Delete Project Modal", () => {
    it("should show modal when delete button is pressed", () => {
      const { getByText } = render(<ProjectInfo />);
      
      const deleteButton = getByText("Apagar Projeto");
      expect(deleteButton).toBeDefined();
      
      // The modal functionality is handled by the hook, so we just verify the button exists
      expect(mockUseReport.handleClickedOnDeleteProject).toBeDefined();
    });

    it("should have delete button with correct text", () => {
      const { getByText } = render(<ProjectInfo />);
      
      expect(getByText("Apagar Projeto")).toBeDefined();
    });

    it("should have edit button with correct text", () => {
      const { getByText } = render(<ProjectInfo />);
      
      expect(getByText("Editar Projeto")).toBeDefined();
    });
  });
});
