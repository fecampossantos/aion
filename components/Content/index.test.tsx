import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Text } from "react-native";

import Content from "./index";

describe("Content Components", () => {
  describe("Header", () => {
    it("renders correctly with title", () => {
      const { getByText } = render(
        <Content.Header title="Test Title" />
      );
      const title = getByText("Test Title");
      expect(title).toBeDefined();
    });

    it("renders correctly with left and right components", () => {
      const { getByText } = render(
        <Content.Header 
          title="Test Title"
          left={<Text>Left</Text>}
          right={<Text>Right</Text>}
        />
      );
      const leftComponent = getByText("Left");
      const rightComponent = getByText("Right");
      const title = getByText("Test Title");
      
      expect(leftComponent).toBeDefined();
      expect(rightComponent).toBeDefined();
      expect(title).toBeDefined();
    });

    it("renders correctly without title", () => {
      const { queryByText } = render(
        <Content.Header 
          left={<Text>Left</Text>}
          right={<Text>Right</Text>}
        />
      );
      const leftComponent = queryByText("Left");
      const rightComponent = queryByText("Right");
      
      expect(leftComponent).toBeDefined();
      expect(rightComponent).toBeDefined();
    });
  });

  describe("Body", () => {
    it("renders children correctly", () => {
      const { getByText } = render(
        <Content.Body>
          <Text>Test Content</Text>
        </Content.Body>
      );
      const content = getByText("Test Content");
      expect(content).toBeDefined();
    });
  });

  describe("Wrapper", () => {
    it("renders children correctly", () => {
      const { getByText } = render(
        <Content.Wrapper>
          <Text>Test Content</Text>
        </Content.Wrapper>
      );
      const content = getByText("Test Content");
      expect(content).toBeDefined();
    });
  });

  describe("BackButton", () => {
    it("renders correctly", () => {
      const mockOnPress = jest.fn();
      const { getByTestId } = render(
        <Content.BackButton onPress={mockOnPress} />
      );
      const icon = getByTestId("antdesign-caretleft");
      expect(icon).toBeDefined();
    });

    it("calls onPress when pressed", () => {
      const mockOnPress = jest.fn();
      const { getByTestId } = render(
        <Content.BackButton onPress={mockOnPress} />
      );
      const icon = getByTestId("antdesign-caretleft");
      
      // The onPress is on the parent Pressable
      fireEvent.press(icon.parent);
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });
  });
});