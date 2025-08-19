import { Task } from "../../interfaces/Task";

describe("Task Interface", () => {
  it("should have the correct structure", () => {
    const task: Task = {
      task_id: 1,
      project_id: 1,
      name: "Test Task",
      completed: 0,
      created_at: new Date("2023-01-01"),
    };

    expect(task).toHaveProperty("task_id");
    expect(task).toHaveProperty("project_id");
    expect(task).toHaveProperty("name");
    expect(task).toHaveProperty("completed");
    expect(task).toHaveProperty("created_at");
  });

  it("should have correct types", () => {
    const task: Task = {
      task_id: 1,
      project_id: 1,
      name: "Test Task",
      completed: 0,
      created_at: new Date("2023-01-01"),
    };

    expect(typeof task.task_id).toBe("number");
    expect(typeof task.project_id).toBe("number");
    expect(typeof task.name).toBe("string");
    expect(typeof task.completed).toBe("number");
    expect(task.created_at).toBeInstanceOf(Date);
  });

  it("should allow completed status as 0 or 1", () => {
    const incompleteTask: Task = {
      task_id: 1,
      project_id: 1,
      name: "Incomplete Task",
      completed: 0,
      created_at: new Date(),
    };

    const completeTask: Task = {
      task_id: 2,
      project_id: 1,
      name: "Complete Task",
      completed: 1,
      created_at: new Date(),
    };

    expect(incompleteTask.completed).toBe(0);
    expect(completeTask.completed).toBe(1);
  });

  it("should allow valid task data", () => {
    const validTasks: Task[] = [
      {
        task_id: 1,
        project_id: 1,
        name: "Task 1",
        completed: 0,
        created_at: new Date(),
      },
      {
        task_id: 999,
        project_id: 999,
        name: "Task with high IDs",
        completed: 1,
        created_at: new Date("2020-01-01"),
      },
    ];

    validTasks.forEach(task => {
      expect(task).toBeDefined();
      expect(task.task_id).toBeGreaterThan(0);
      expect(task.project_id).toBeGreaterThan(0);
      expect(task.name.length).toBeGreaterThan(0);
      expect([0, 1]).toContain(task.completed);
    });
  });
});
