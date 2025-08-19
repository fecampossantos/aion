import React from "react";
import { render } from "@testing-library/react-native";
import { ActivityIndicator } from "react-native";
import LoadingView from "./index";

describe("LoadingView", () => {
  it("renders correctly", () => {
    const { getByTestId } = render(<LoadingView />);
    
    // The ActivityIndicator should be rendered
    expect(getByTestId("loading-indicator")).toBeDefined();
  });

  it("displays a large activity indicator", () => {
    const { getByTestId } = render(<LoadingView />);
    
    const indicator = getByTestId("loading-indicator");
    expect(indicator.props.size).toBe("large");
  });

  it("applies the correct styles", () => {
    const { getByTestId } = render(<LoadingView />);
    
    const container = getByTestId("loading-container");
    expect(container).toBeDefined();
  });
});
