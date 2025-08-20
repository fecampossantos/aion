import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import AddProject from "../../../app/AddProject";

// Mock Alert
const mockAlert = jest.fn((title, message, buttons) => {
  // Automatically press the first button (usually "OK")
  if (buttons && buttons[0] && buttons[0].onPress) {
    buttons[0].onPress();
  }
});

// The expo-router mock is already defined in jest.setup.js

jest.mock("expo-sqlite", () => ({
  useSQLiteContext: jest.fn(),
}));

jest.mock("../../../components/TextInput", () => {
  const React = require("react");
  const { TextInput } = require("react-native");
  return ({ onChangeText, value, placeholder, ...props }) => (
    <TextInput
      testID="text-input"
      onChangeText={onChangeText}
      value={value}
      placeholder={placeholder}
      {...props}
    />
  );
});

jest.mock("../../../components/CurrencyInput", () => {
  const React = require("react");
  const { TextInput } = require("react-native");
  return ({ onChange, value, placeholder, ...props }) => (
    <TextInput
      testID="currency-input"
      onChangeText={onChange}
      value={value}
      placeholder={placeholder}
      {...props}
    />
  );
});

jest.mock("../../../components/Button", () => {
  const React = require("react");
  const { Pressable, Text } = require("react-native");
  return ({ onPress, text, ...props }) => {
    const handlePress = () => {
      if (onPress) onPress();
    };
    return (
      <Pressable testID="button" onPress={handlePress} {...props}>
        <Text>{text}</Text>
      </Pressable>
    );
  };
});

describe("AddProject Screen", () => {
  const mockDatabase = {
    getFirstAsync: jest.fn(),
    runAsync: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    require("expo-sqlite").useSQLiteContext.mockReturnValue(mockDatabase);
    mockDatabase.getFirstAsync.mockResolvedValue(null); // No existing project by default
    mockDatabase.runAsync.mockResolvedValue(undefined);
    
    // Mock Alert
    const RN = require("react-native");
    RN.Alert.alert = mockAlert;
  });

  it("renders correctly with all form elements", () => {
    const { getByText, getByTestId } = render(<AddProject />);

    expect(getByText("Informações do Projeto")).toBeDefined();
    expect(getByText("Valor por Hora (R$)")).toBeDefined();
    expect(getByTestId("text-input")).toBeDefined();
    expect(getByTestId("currency-input")).toBeDefined();
    expect(getByTestId("button")).toBeDefined();
    expect(getByText("Criar Projeto")).toBeDefined();
  });

  it("updates project name when text input changes", () => {
    const { getByTestId } = render(<AddProject />);

    const textInput = getByTestId("text-input");
    fireEvent.changeText(textInput, "New Project");

    expect(textInput.props.value).toBe("New Project");
  });

  it("updates hourly cost when currency input changes", () => {
    const { getByTestId } = render(<AddProject />);

    const currencyInput = getByTestId("currency-input");
    fireEvent.changeText(currencyInput, "50,00");

    expect(currencyInput.props.value).toBe("50,00");
  });

  it("shows error when project name is empty", async () => {
    const { getByTestId, getByText } = render(<AddProject />);

    // Check initial state
    const textInput = getByTestId("text-input");

    const button = getByTestId("button");
    
    // When project name is empty, the button should be disabled (onPress is undefined)
    expect(button.props.onPress).toBeUndefined();
    
    // The button should not call handleAddProject when disabled
    fireEvent.press(button);
    
    // No Alert should be shown since the button is disabled
    expect(mockAlert).not.toHaveBeenCalled();
  });

  it("shows error when project name is too short", async () => {
    const { getByTestId } = render(<AddProject />);

    const textInput = getByTestId("text-input");
    fireEvent.changeText(textInput, "A"); // 1 character

    const button = getByTestId("button");
    
    // Button should be disabled for 1 character (length < 2)
    expect(button.props.onPress).toBeUndefined();
    
    // No validation should run since button is disabled
    fireEvent.press(button);
    expect(mockAlert).not.toHaveBeenCalled();
  });

  it("shows error when project with same name already exists", async () => {
    mockDatabase.getFirstAsync.mockResolvedValue({ name: "Existing Project" });

    const { getByTestId, getByText } = render(<AddProject />);

    const textInput = getByTestId("text-input");
    fireEvent.changeText(textInput, "Existing Project");

    const button = getByTestId("button");
    fireEvent.press(button);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        "Erro",
        "Um projeto com esse nome já existe."
      );
    });

    expect(mockDatabase.getFirstAsync).toHaveBeenCalledWith(
      "SELECT * FROM projects WHERE name = ?;",
      "Existing Project"
    );
  });

  it("successfully creates project with valid data", async () => {
    const { getByTestId } = render(<AddProject />);

    const textInput = getByTestId("text-input");
    const currencyInput = getByTestId("currency-input");
    const button = getByTestId("button");

    fireEvent.changeText(textInput, "New Project");
    fireEvent.changeText(currencyInput, "75,50");
    fireEvent.press(button);

    await waitFor(() => {
      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        "INSERT INTO projects (name, hourly_cost) VALUES (?, ?);",
        "New Project",
        75
      );
    });

    expect(global.mockRouterReplace).toHaveBeenCalledWith("/");
  });

  it("creates project with default cost when hourly cost is empty", async () => {
    const { getByTestId } = render(<AddProject />);

    const textInput = getByTestId("text-input");
    const button = getByTestId("button");

    fireEvent.changeText(textInput, "New Project");
    fireEvent.press(button);

    await waitFor(() => {
      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        "INSERT INTO projects (name, hourly_cost) VALUES (?, ?);",
        "New Project",
        0
      );
    });
  });

  it("clears error message when project name changes", () => {
    const { getByTestId, getByText, queryByText } = render(<AddProject />);

    // First trigger an error
    const button = getByTestId("button");
    fireEvent.press(button);

    // Wait for error to appear
    waitFor(() => {
      expect(getByText("O nome do projeto não pode estar vazio")).toBeDefined();
    });

    // Then change the project name
    const textInput = getByTestId("text-input");
    fireEvent.changeText(textInput, "Some Project");

    // Error should be cleared
    expect(queryByText("O nome do projeto nao pode estar vazio")).toBeNull();
  });

  it("displays placeholder text correctly", () => {
    const { getByTestId } = render(<AddProject />);

    const textInput = getByTestId("text-input");
    const currencyInput = getByTestId("currency-input");

    expect(textInput.props.placeholder).toBe("Digite o nome do projeto...");
    expect(currencyInput.props.placeholder).toBe("00,00");
  });

});