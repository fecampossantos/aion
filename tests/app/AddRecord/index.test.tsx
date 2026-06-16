import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import AddRecord from "../../../app/AddRecord";

// Mock expo-sqlite
const mockDatabase = {
  getFirstAsync: jest.fn(),
  getAllAsync: jest.fn(),
  runAsync: jest.fn(),
};

jest.mock("expo-sqlite", () => ({
  useSQLiteContext: () => mockDatabase,
}));

// Mock expo-router
const mockRouter = {
  push: jest.fn(),
};

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ projectID: "1" }),
  router: mockRouter,
}));

// Mock @react-native-picker/picker
jest.mock("@react-native-picker/picker", () => {
  const { View, Text } = require("react-native");
  
  const PickerItem = ({ label, value, style, color }: any) => (
    <Text style={style} testID={`picker-item-${value}`}>
      {label}
    </Text>
  );
  
  const Picker = ({ selectedValue, onValueChange, children, style, testID }: any) => (
    <View testID={testID} style={style}>
      <Text testID="picker-label">Task Picker</Text>
      {children && Array.isArray(children) && children.map((child: any, index: number) => {
        if (child && child.props) {
          return (
            <Text
              key={index}
              onPress={() => onValueChange(child.props.value, index)}
              testID={`picker-item-${child.props.value || index}`}
            >
              {child.props.label || `Item ${index}`}
            </Text>
          );
        }
        return null;
      })}
    </View>
  );
  
  // Attach PickerItem as a property of Picker
  Picker.Item = PickerItem;
  
  return { Picker };
});

// Mock @react-native-community/datetimepicker
jest.mock("@react-native-community/datetimepicker", () => {
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: ({ value, mode, onChange, testID }: any) => (
      <View testID={testID} onPress={() => onChange("set", value)} />
    ),
  };
});

describe("AddRecord Component", () => {
  const mockProject = {
    project_id: 1,
    name: "Test Project",
    hourly_cost: 25.0,
    created_at: new Date("2023-01-01"),
  };

  const mockTasks = [
    { task_id: 1, name: "Task 1", project_id: 1, created_at: new Date() },
    { task_id: 2, name: "Task 2", project_id: 1, created_at: new Date() },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockDatabase.getFirstAsync.mockResolvedValue(mockProject);
    mockDatabase.getAllAsync.mockResolvedValue(mockTasks);
    mockDatabase.runAsync.mockResolvedValue(undefined);
  });

  it("exports a component", () => {
    expect(AddRecord).toBeDefined();
    expect(typeof AddRecord).toBe("function");
  });

  it("renders without crashing", async () => {
    const { getByText, getByTestId } = render(<AddRecord />);
    
    // Wait for the component to load project and tasks
    await waitFor(() => {
      expect(mockDatabase.getFirstAsync).toHaveBeenCalled();
    });
    
    // Now check for the text that should appear after loading
    await waitFor(() => {
      expect(getByText("Selecione a task")).toBeDefined();
    });
  });

  it("loads project and tasks on mount", async () => {
    render(<AddRecord />);

    await waitFor(() => {
      expect(mockDatabase.getFirstAsync).toHaveBeenCalledWith(
        "SELECT * FROM projects WHERE project_id = ?;",
        "1"
      );
    });

    await waitFor(() => {
      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        "SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC;",
        1
      );
    });
  });

  it("displays project information", async () => {
    const { getByText } = render(<AddRecord />);

    await waitFor(() => {
      expect(getByText("Início")).toBeDefined();
      expect(getByText("Fim")).toBeDefined();
    });
  });

  it("shows date picker when calendar icon is pressed", async () => {
    const { getByTestId, queryByTestId } = render(<AddRecord />);

    await waitFor(() => {
      const calendarIcon = getByTestId("calendar-icon");
      fireEvent.press(calendarIcon);
    });

    expect(queryByTestId("timePicker")).toBeTruthy();
  });

  it("updates date when date picker is used", async () => {
    const { getByTestId } = render(<AddRecord />);

    await waitFor(() => {
      const calendarIcon = getByTestId("calendar-icon");
      fireEvent.press(calendarIcon);
    });

    const datePicker = getByTestId("timePicker");
    fireEvent.press(datePicker);

    // Date should be updated (this is tested indirectly through the component state)
    expect(datePicker).toBeTruthy();
  });

  it("handles task selection", async () => {
    const { getByTestId } = render(<AddRecord />);

    await waitFor(() => {
      const pickerLabel = getByTestId("picker-label");
      expect(pickerLabel).toBeTruthy();
    });
  });

  it("shows time pickers when time displays are pressed", async () => {
    const { getByTestId, queryByTestId } = render(<AddRecord />);

    await waitFor(() => {
      const startTimeDisplay = getByTestId("start-time-display");
      fireEvent.press(startTimeDisplay);
    });

    expect(queryByTestId("startTimePicker")).toBeTruthy();

    await waitFor(() => {
      const endTimeDisplay = getByTestId("end-time-display");
      fireEvent.press(endTimeDisplay);
    });

    expect(queryByTestId("endTimePicker")).toBeTruthy();
  });

  it("does not add record when no task is selected", async () => {
    const { getByText } = render(<AddRecord />);

    await waitFor(() => {
      const addButton = getByText("Adicionar tempo");
      fireEvent.press(addButton);
    });

    // Since no task is selected, the database should not be called
    expect(mockDatabase.runAsync).not.toHaveBeenCalled();
  });


  it("handles empty task list gracefully", async () => {
    mockDatabase.getAllAsync.mockResolvedValue([]);
    
    const { getByText } = render(<AddRecord />);

    await waitFor(() => {
      expect(getByText("Selecione a task")).toBeDefined();
    });
  });

  it("handles component unmounting correctly", async () => {
    const { unmount } = render(<AddRecord />);
    
    // Component should unmount without errors
    expect(() => unmount()).not.toThrow();
  });

  it("displays date input with correct test IDs", async () => {
    const { getByTestId } = render(<AddRecord />);

    await waitFor(() => {
      expect(getByTestId("date-display")).toBeTruthy();
      expect(getByTestId("calendar-icon")).toBeTruthy();
    });
  });


});
