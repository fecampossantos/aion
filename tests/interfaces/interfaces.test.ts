import { Project } from "../../interfaces/Project";
import { Task } from "../../interfaces/Task";
import { Timing } from "../../interfaces/Timing";

describe("TypeScript Interfaces", () => {
  describe("Project Interface", () => {
    it("should accept valid project objects", () => {
      const validProject: Project = {
        project_id: 1,
        name: "Test Project",
        hourly_cost: 50.0,
        created_at: new Date("2023-12-01"),
      };

      expect(validProject.project_id).toBe(1);
      expect(validProject.name).toBe("Test Project");
      expect(validProject.hourly_cost).toBe(50.0);
      expect(validProject.created_at).toBeInstanceOf(Date);
    });

    it("should handle different hourly cost values", () => {
      const projectWithZeroCost: Project = {
        project_id: 1,
        name: "Free Project",
        hourly_cost: 0,
        created_at: new Date(),
      };

      const projectWithHighCost: Project = {
        project_id: 2,
        name: "Premium Project",
        hourly_cost: 999.99,
        created_at: new Date(),
      };

      expect(projectWithZeroCost.hourly_cost).toBe(0);
      expect(projectWithHighCost.hourly_cost).toBe(999.99);
    });

    it("should handle different project names", () => {
      const projects: Project[] = [
        {
          project_id: 1,
          name: "Short",
          hourly_cost: 10,
          created_at: new Date(),
        },
        {
          project_id: 2,
          name: "A very long project name with many characters",
          hourly_cost: 20,
          created_at: new Date(),
        },
        {
          project_id: 3,
          name: "Project with numbers 123 and symbols !@#",
          hourly_cost: 30,
          created_at: new Date(),
        },
      ];

      projects.forEach((project, index) => {
        expect(project.project_id).toBe(index + 1);
        expect(typeof project.name).toBe("string");
        expect(project.name.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Task Interface", () => {
    it("should accept valid task objects", () => {
      const validTask: Task = {
        task_id: 1,
        project_id: 1,
        name: "Test Task",
        completed: 0,
        created_at: new Date("2023-12-01"),
      };

      expect(validTask.task_id).toBe(1);
      expect(validTask.project_id).toBe(1);
      expect(validTask.name).toBe("Test Task");
      expect(validTask.completed).toBe(0);
      expect(validTask.created_at).toBeInstanceOf(Date);
    });

    it("should handle completed status correctly", () => {
      const incompleteTasks: Task = {
        task_id: 1,
        project_id: 1,
        name: "Incomplete Task",
        completed: 0,
        created_at: new Date(),
      };

      const completedTask: Task = {
        task_id: 2,
        project_id: 1,
        name: "Completed Task",
        completed: 1,
        created_at: new Date(),
      };

      expect(incompleteTasks.completed).toBe(0);
      expect(completedTask.completed).toBe(1);
    });

    it("should handle task relationships correctly", () => {
      const tasksForProject1: Task[] = [
        {
          task_id: 1,
          project_id: 1,
          name: "Task 1",
          completed: 0,
          created_at: new Date(),
        },
        {
          task_id: 2,
          project_id: 1,
          name: "Task 2",
          completed: 1,
          created_at: new Date(),
        },
      ];

      const tasksForProject2: Task[] = [
        {
          task_id: 3,
          project_id: 2,
          name: "Task 3",
          completed: 0,
          created_at: new Date(),
        },
      ];

      tasksForProject1.forEach(task => {
        expect(task.project_id).toBe(1);
      });

      tasksForProject2.forEach(task => {
        expect(task.project_id).toBe(2);
      });
    });
  });

  describe("Timing Interface", () => {
    it("should accept valid timing objects", () => {
      const validTiming: Timing = {
        timing_id: 1,
        task_id: 1,
        time: 3600, // 1 hour in seconds
        created_at: "2023-12-01T10:00:00Z",
      };

      expect(validTiming.timing_id).toBe(1);
      expect(validTiming.task_id).toBe(1);
      expect(validTiming.time).toBe(3600);
      expect(validTiming.created_at).toBe("2023-12-01T10:00:00Z");
    });

    it("should handle different time durations", () => {
      const timings: Timing[] = [
        {
          timing_id: 1,
          task_id: 1,
          time: 0, // No time
          created_at: "2023-12-01T10:00:00Z",
        },
        {
          timing_id: 2,
          task_id: 1,
          time: 60, // 1 minute
          created_at: "2023-12-01T10:01:00Z",
        },
        {
          timing_id: 3,
          task_id: 1,
          time: 3600, // 1 hour
          created_at: "2023-12-01T11:00:00Z",
        },
        {
          timing_id: 4,
          task_id: 1,
          time: 86400, // 1 day
          created_at: "2023-12-02T10:00:00Z",
        },
      ];

      expect(timings[0].time).toBe(0);
      expect(timings[1].time).toBe(60);
      expect(timings[2].time).toBe(3600);
      expect(timings[3].time).toBe(86400);
    });

    it("should handle timing relationships correctly", () => {
      const timingsForTask1: Timing[] = [
        {
          timing_id: 1,
          task_id: 1,
          time: 1800,
          created_at: "2023-12-01T10:00:00Z",
        },
        {
          timing_id: 2,
          task_id: 1,
          time: 2700,
          created_at: "2023-12-01T11:00:00Z",
        },
      ];

      const totalTimeForTask1 = timingsForTask1.reduce((sum, timing) => sum + timing.time, 0);

      expect(totalTimeForTask1).toBe(4500); // 1800 + 2700
      timingsForTask1.forEach(timing => {
        expect(timing.task_id).toBe(1);
      });
    });

    it("should handle date string format", () => {
      const timing: Timing = {
        timing_id: 1,
        task_id: 1,
        time: 3600,
        created_at: "2023-12-01T10:30:45.123Z",
      };

      expect(typeof timing.created_at).toBe("string");
      expect(timing.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe("Interface Relationships", () => {
    it("should work together in a complete workflow", () => {
      const project: Project = {
        project_id: 1,
        name: "Complete Project",
        hourly_cost: 50.0,
        created_at: new Date("2023-12-01"),
      };

      const tasks: Task[] = [
        {
          task_id: 1,
          project_id: project.project_id,
          name: "Task 1",
          completed: 1,
          created_at: new Date("2023-12-01"),
        },
        {
          task_id: 2,
          project_id: project.project_id,
          name: "Task 2",
          completed: 0,
          created_at: new Date("2023-12-01"),
        },
      ];

      const timings: Timing[] = [
        {
          timing_id: 1,
          task_id: tasks[0].task_id,
          time: 3600, // 1 hour
          created_at: "2023-12-01T10:00:00Z",
        },
        {
          timing_id: 2,
          task_id: tasks[1].task_id,
          time: 1800, // 30 minutes
          created_at: "2023-12-01T11:00:00Z",
        },
      ];

      // Verify relationships
      expect(tasks.every(task => task.project_id === project.project_id)).toBe(true);
      expect(timings.every(timing => 
        tasks.some(task => task.task_id === timing.task_id)
      )).toBe(true);

      // Calculate total project time
      const totalProjectTime = timings.reduce((sum, timing) => sum + timing.time, 0);
      expect(totalProjectTime).toBe(5400); // 1.5 hours

      // Calculate project cost
      const totalHours = totalProjectTime / 3600;
      const projectCost = totalHours * project.hourly_cost;
      expect(projectCost).toBe(75); // 1.5 * 50
    });
  });
});