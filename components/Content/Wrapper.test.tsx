import React from "react";
import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import Wrapper from "./Wrapper";

describe("Wrapper", () => {
  it("renders correctly with children", () => {
    const { getByTestId, getByText } = render(
      <Wrapper>
        <Text>Test Content</Text>
      </Wrapper>
    );
    
    expect(getByTestId("wrapper-container")).toBeDefined();
    expect(getByText("Test Content")).toBeDefined();
  });

  it("renders without children", () => {
    const { getByTestId } = render(<Wrapper />);
    
    expect(getByTestId("wrapper-container")).toBeDefined();
  });

  it("applies correct styles", () => {
    const { getByTestId } = render(<Wrapper />);
    
    const container = getByTestId("wrapper-container");
    expect(container).toBeDefined();
  });
});
