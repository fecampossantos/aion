import { renderHook, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import useReport from "./useReport";

// Mock dependencies
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock("expo-sqlite", () => ({
  useSQLiteContext: jest.fn(),
}));

jest.mock("react-native", () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

jest.mock("./utils", () => ({
  getEndOfDay: jest.fn((date) => date.toISOString()),
  getInitOfDay: jest.fn((date) => date.toISOString()),
  prepareResultSet: jest.fn((data) => ({
    labels: data.map(item => item.day),
    datasets: [{ data: data.map(item => item.total_time) }],
  })),
}));

describe("useReport Hook", () => {
  const mockDatabase = {
    getFirstAsync: jest.fn(),
    getAllAsync: jest.fn(),
    runAsync: jest.fn(),
  };

  const mockProject = {
    project_id: 1,
    name: "Test Project",
    hourly_cost: 50.0,
    created_at: new Date("2023-12-01"),
  };

  const mockTimingsData = [
    { day: "2023-12-01", total_time: 3600 },
    { day: "2023-12-02", total_time: 1800 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    require("expo-sqlite").useSQLiteContext.mockReturnValue(mockDatabase);
    mockDatabase.getFirstAsync.mockResolvedValue(mockProject);
    mockDatabase.getAllAsync.mockResolvedValue(mockTimingsData);
  });

  it("initializes with correct default values", () => {
    const { result } = renderHook(() => useReport("1"));

    expect(result.current.startDate).toBeInstanceOf(Date);
    expect(result.current.endDate).toBeInstanceOf(Date);
    expect(result.current.showDatePicker).toBe(false);
    expect(result.current.dateShown).toBe(null);
    expect(result.current.resultSet).toBeUndefined();
    expect(result.current.showChart).toBe(false);
    expect(result.current.project).toBeUndefined();
  });

  it("initializes startDate to 7 days ago", () => {
    const { result } = renderHook(() => useReport("1"));
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const startDate = result.current.startDate;
    expect(startDate.getDate()).toBe(sevenDaysAgo.getDate());
  });

  describe("getProject", () => {
    it("fetches and sets project data", async () => {
      const { result } = renderHook(() => useReport("1"));

      await act(async () => {
        await result.current.getProject();
      });

      expect(mockDatabase.getFirstAsync).toHaveBeenCalledWith(
        "SELECT * FROM projects WHERE project_id = ?;",
        "1"
      );
      expect(result.current.project).toEqual(mockProject);
    });
  });

  describe("getTimings", () => {
    it("fetches timings data and updates chart state", async () => {
      const { result } = renderHook(() => useReport("1"));

      await act(async () => {
        await result.current.getTimings();
      });

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining("SELECT"),
        "1",
        expect.any(String),
        expect.any(String)
      );
      expect(result.current.showChart).toBe(true);
      expect(result.current.resultSet).toEqual({
        labels: ["2023-12-01", "2023-12-02"],
        datasets: [{ data: [3600, 1800] }],
      });
    });

    it("handles database errors gracefully", async () => {
      mockDatabase.getAllAsync.mockRejectedValue(new Error("DB Error"));
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      const { result } = renderHook(() => useReport("1"));

      await act(async () => {
        await result.current.getTimings();
      });

      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe("handleClickedOnDeleteProject", () => {
    it("shows delete confirmation alert", () => {
      const { result } = renderHook(() => useReport("1"));

      act(() => {
        result.current.handleClickedOnDeleteProject();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        "Apagar projeto?",
        "Você perderá todas as informações dele!",
        expect.arrayContaining([
          expect.objectContaining({ text: "Cancelar", style: "cancel" }),
          expect.objectContaining({ text: "Apagar", style: "destructive" }),
        ])
      );
    });
  });

  describe("handleUpdateDate", () => {
    it("updates start date when dateShown is start", () => {
      const { result } = renderHook(() => useReport("1"));
      const newDate = new Date("2023-12-15");

      // First set dateShown to "start"
      act(() => {
        result.current.handleShowDatePicker("start");
      });

      act(() => {
        result.current.handleUpdateDate({ type: "set" }, newDate);
      });

      expect(result.current.startDate).toEqual(newDate);
      expect(result.current.showDatePicker).toBe(false);
    });

    it("updates end date when dateShown is end", () => {
      const { result } = renderHook(() => useReport("1"));
      const newDate = new Date("2023-12-20");

      // First set dateShown to "end"
      act(() => {
        result.current.handleShowDatePicker("end");
      });

      act(() => {
        result.current.handleUpdateDate({ type: "set" }, newDate);
      });

      expect(result.current.endDate).toEqual(newDate);
      expect(result.current.showDatePicker).toBe(false);
    });

    it("does not update date when event type is not set", () => {
      const { result } = renderHook(() => useReport("1"));
      const originalStartDate = result.current.startDate;

      act(() => {
        result.current.handleShowDatePicker("start");
      });

      act(() => {
        result.current.handleUpdateDate({ type: "dismissed" }, new Date());
      });

      expect(result.current.startDate).toEqual(originalStartDate);
    });
  });

  describe("handleShowDatePicker", () => {
    it("shows date picker for start date", () => {
      const { result } = renderHook(() => useReport("1"));

      act(() => {
        result.current.handleShowDatePicker("start");
      });

      expect(result.current.dateShown).toBe("start");
      expect(result.current.datePickerValue).toEqual(result.current.startDate);
      expect(result.current.showDatePicker).toBe(true);
    });

    it("shows date picker for end date", () => {
      const { result } = renderHook(() => useReport("1"));

      act(() => {
        result.current.handleShowDatePicker("end");
      });

      expect(result.current.dateShown).toBe("end");
      expect(result.current.datePickerValue).toEqual(result.current.endDate);
      expect(result.current.showDatePicker).toBe(true);
    });
  });
});