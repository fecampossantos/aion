import React from "react";
import { render } from "@testing-library/react-native";
import { Text, TouchableOpacity } from "react-native";
import Header from "../../../components/Content/Header";

describe("Header", () => {
  it("renders correctly with all props", () => {
    const { getByTestId, getByText } = render(
      <Header
        left={<TouchableOpacity><Text>Left Button</Text></TouchableOpacity>}
        title="Test Title"
        right={<TouchableOpacity><Text>Right Button</Text></TouchableOpacity>}
      />
    );
    
    expect(getByTestId("header-container")).toBeDefined();
    expect(getByTestId("header-title")).toBeDefined();
    expect(getByTestId("header-left")).toBeDefined();
    expect(getByTestId("header-right")).toBeDefined();
    expect(getByText("Test Title")).toBeDefined();
    expect(getByText("Left Button")).toBeDefined();
    expect(getByText("Right Button")).toBeDefined();
  });

  it("renders with only title", () => {
    const { getByTestId, getByText, queryByTestId } = render(
      <Header title="Only Title" />
    );
    
    expect(getByTestId("header-container")).toBeDefined();
    expect(getByTestId("header-title")).toBeDefined();
    expect(getByText("Only Title")).toBeDefined();
    expect(queryByTestId("header-left")).toBeNull();
    expect(queryByTestId("header-right")).toBeNull();
  });

  it("renders with only left button", () => {
    const { getByTestId, queryByTestId } = render(
      <Header left={<TouchableOpacity><Text>Left Only</Text></TouchableOpacity>} />
    );
    
    expect(getByTestId("header-container")).toBeDefined();
    expect(getByTestId("header-left")).toBeDefined();
    expect(queryByTestId("header-title")).toBeNull();
    expect(queryByTestId("header-right")).toBeNull();
  });

  it("renders with only right button", () => {
    const { getByTestId, queryByTestId } = render(
      <Header right={<TouchableOpacity><Text>Right Only</Text></TouchableOpacity>} />
    );
    
    expect(getByTestId("header-container")).toBeDefined();
    expect(getByTestId("header-right")).toBeDefined();
    expect(queryByTestId("header-title")).toBeNull();
    expect(queryByTestId("header-left")).toBeNull();
  });

  it("renders without any props", () => {
    const { getByTestId, queryByTestId } = render(<Header />);
    
    expect(getByTestId("header-container")).toBeDefined();
    expect(queryByTestId("header-title")).toBeNull();
    expect(queryByTestId("header-left")).toBeNull();
    expect(queryByTestId("header-right")).toBeNull();
  });
});
