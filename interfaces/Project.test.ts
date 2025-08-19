import { Project } from "./Project";

describe("Project Interface", () => {
  it("should have the correct structure", () => {
    const project: Project = {
      project_id: 1,
      name: "Test Project",
      hourly_cost: 25.50,
      created_at: new Date("2023-01-01"),
    };

    expect(project).toHaveProperty("project_id");
    expect(project).toHaveProperty("name");
    expect(project).toHaveProperty("hourly_cost");
    expect(project).toHaveProperty("created_at");
  });

  it("should have correct types", () => {
    const project: Project = {
      project_id: 1,
      name: "Test Project",
      hourly_cost: 25.50,
      created_at: new Date("2023-01-01"),
    };

    expect(typeof project.project_id).toBe("number");
    expect(typeof project.name).toBe("string");
    expect(typeof project.hourly_cost).toBe("number");
    expect(project.created_at).toBeInstanceOf(Date);
  });

  it("should allow valid project data", () => {
    const validProjects: Project[] = [
      {
        project_id: 1,
        name: "Project 1",
        hourly_cost: 0,
        created_at: new Date(),
      },
      {
        project_id: 999,
        name: "Project with high ID",
        hourly_cost: 999.99,
        created_at: new Date("2020-01-01"),
      },
    ];

    validProjects.forEach(project => {
      expect(project).toBeDefined();
      expect(project.project_id).toBeGreaterThan(0);
      expect(project.name.length).toBeGreaterThan(0);
      expect(project.hourly_cost).toBeGreaterThanOrEqual(0);
    });
  });
});
