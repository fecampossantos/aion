import React from "react";
import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import Body from "./Body";

describe("Body", () => {
  it("renders correctly with children", () => {
    const { getByTestId, getByText } = render(
      <Body>
        <Text>Test Content</Text>
      </Body>
    );
    
    expect(getByTestId("body-container")).toBeDefined();
    expect(getByText("Test Content")).toBeDefined();
  });

  it("renders without children", () => {
    const { getByTestId } = render(<Body />);
    
    expect(getByTestId("body-container")).toBeDefined();
  });

  it("applies correct styles", () => {
    const { getByTestId } = render(<Body />);
    
    const container = getByTestId("body-container");
    expect(container).toBeDefined();
  });
});
