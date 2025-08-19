import Content from "./index";

describe("Content", () => {
  it("exports all required components", () => {
    expect(Content.Header).toBeDefined();
    expect(Content.Body).toBeDefined();
    expect(Content.Wrapper).toBeDefined();
    expect(Content.BackButton).toBeDefined();
  });

  it("has correct component structure", () => {
    expect(typeof Content.Header).toBe("function");
    expect(typeof Content.Body).toBe("function");
    expect(typeof Content.Wrapper).toBe("function");
    expect(typeof Content.BackButton).toBe("function");
  });
});