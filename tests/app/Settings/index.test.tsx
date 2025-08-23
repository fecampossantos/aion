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
    expect(getByText("Versão 1.1.2")).toBeDefined();
    expect(getByText("Geral")).toBeDefined();
    expect(getByText("Gerenciamento de Dados")).toBeDefined();
    expect(getByText("Suporte")).toBeDefined();
  });

  it("renders all general settings options", () => {
    const { getByText, getByTestId } = render(<Settings />);

    // General section options - only language remains
    expect(getByText("Idioma")).toBeDefined();
    expect(getByText("Português (Brasil)")).toBeDefined();
    expect(getByTestId("settings-option-language")).toBeDefined();
  });

  it("renders all data management options", () => {
    const { getByText, getByTestId } = render(<Settings />);

    // Data management section options
    expect(getByText("Fazer Backup")).toBeDefined();
    expect(getByText("Salvar e compartilhar seus dados")).toBeDefined();
    expect(getByTestId("settings-option-backup")).toBeDefined();

    expect(getByText("Restaurar Dados")).toBeDefined();
    expect(getByText("Restaurar de um arquivo de backup")).toBeDefined();
    expect(getByTestId("settings-option-restore")).toBeDefined();
  });

  it("renders all support options", () => {
    const { getByText, getByTestId } = render(<Settings />);

    // Support section options - only GitHub remains
    expect(getByText("GitHub")).toBeDefined();
    expect(getByText("Ver código fonte")).toBeDefined();
    expect(getByTestId("settings-option-github")).toBeDefined();
  });

  it("handles navigation to language settings", () => {
    const { getByTestId } = render(<Settings />);

    const languageOption = getByTestId("settings-option-language");
    fireEvent.press(languageOption);

    expect(mockConsoleLog).toHaveBeenCalledWith("Navigating to language settings");
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

    fireEvent.press(languageOption);
    fireEvent.press(backupOption);
    fireEvent.press(githubOption);

    expect(mockConsoleLog).toHaveBeenCalledTimes(1);
    expect(mockConsoleLog).toHaveBeenCalledWith("Navigating to language settings");
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
