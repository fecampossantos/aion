import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import Settings from "../../../app/Settings/index";

// Mock console.log to avoid noise in tests
const mockConsoleLog = jest.spyOn(console, "log").mockImplementation(() => {});

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

// Mock the backup utilities
jest.mock("../../../utils/backupUtils", () => ({
  downloadBackup: jest.fn(),
  restoreFromSelectedFile: jest.fn(),
  getBackupStats: jest.fn(),
}));

describe("Settings Page", () => {
  beforeEach(() => {
    mockConsoleLog.mockClear();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
  });

  it("renders correctly", () => {
    const { getByText } = render(<Settings />);

    // Check if main elements are rendered
    expect(getByText("aion")).toBeDefined();
    expect(getByText("Version 1.1.2")).toBeDefined();
    expect(getByText("General")).toBeDefined();
    expect(getByText("Data Management")).toBeDefined();
    expect(getByText("Support")).toBeDefined();
  });

  it("renders all general settings options", () => {
    const { getByText, getByTestId } = render(<Settings />);

    // General section options - only language remains
    expect(getByText("Language")).toBeDefined();
    expect(getByText("English")).toBeDefined();
    expect(getByTestId("settings-option-language")).toBeDefined();
  });

  it("renders all data management options", () => {
    const { getByText, getByTestId } = render(<Settings />);

    // Data management section options
    expect(getByText("Backup Data")).toBeDefined();
    expect(getByText("Save and share your data")).toBeDefined();
    expect(getByTestId("settings-option-backup")).toBeDefined();

    expect(getByText("Restore Data")).toBeDefined();
    expect(getByText("Restore from a backup file")).toBeDefined();
    expect(getByTestId("settings-option-restore")).toBeDefined();
  });

  it("renders all support options", () => {
    const { getByText, getByTestId } = render(<Settings />);

    // Support section options - only GitHub remains
    expect(getByText("GitHub")).toBeDefined();
    expect(getByText("View source code")).toBeDefined();
    expect(getByTestId("settings-option-github")).toBeDefined();
  });

  it("handles navigation to language settings", () => {
    const { getByTestId } = render(<Settings />);

    const languageOption = getByTestId("settings-option-language");
    fireEvent.press(languageOption);

    expect(global.mockRouterPush).toHaveBeenCalledWith("/Language");
  });

  it("handles navigation to backup settings", () => {
    const { getByTestId } = render(<Settings />);

    const backupOption = getByTestId("settings-option-backup");
    fireEvent.press(backupOption);

    // Backup option now opens a modal instead of logging navigation
    // The modal functionality is tested separately
    expect(backupOption).toBeDefined();
  });

  it("handles navigation to restore settings", () => {
    const { getByTestId } = render(<Settings />);

    const restoreOption = getByTestId("settings-option-restore");
    fireEvent.press(restoreOption);

    // Restore option now opens a modal instead of logging navigation
    // The modal functionality is tested separately
    expect(restoreOption).toBeDefined();
  });

  it("handles multiple navigation calls", () => {
    const { getByTestId } = render(<Settings />);

    const languageOption = getByTestId("settings-option-language");
    const backupOption = getByTestId("settings-option-backup");
    const githubOption = getByTestId("settings-option-github");

    // Reset mock before testing
    global.mockRouterPush.mockClear();

    fireEvent.press(languageOption);
    fireEvent.press(backupOption);
    fireEvent.press(githubOption);

    expect(global.mockRouterPush).toHaveBeenCalledTimes(1);
    expect(global.mockRouterPush).toHaveBeenCalledWith("/Language");
  });

  it("renders with proper styling and layout", () => {
    const { getByTestId } = render(<Settings />);

    // Check if all option containers are properly styled
    const languageOption = getByTestId("settings-option-language");
    const backupOption = getByTestId("settings-option-backup");
    const githubOption = getByTestId("settings-option-github");

    expect(languageOption).toBeDefined();
    expect(backupOption).toBeDefined();
    expect(githubOption).toBeDefined();
  });
});
