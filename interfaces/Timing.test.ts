import { Timing } from "./Timing";

describe("Timing Interface", () => {
  it("should have the correct structure", () => {
    const timing: Timing = {
      timing_id: 1,
      task_id: 1,
      time: 3600,
      created_at: "2023-01-01T10:00:00Z",
    };

    expect(timing).toHaveProperty("timing_id");
    expect(timing).toHaveProperty("task_id");
    expect(timing).toHaveProperty("time");
    expect(timing).toHaveProperty("created_at");
  });

  it("should have correct types", () => {
    const timing: Timing = {
      timing_id: 1,
      task_id: 1,
      time: 3600,
      created_at: "2023-01-01T10:00:00Z",
    };

    expect(typeof timing.timing_id).toBe("number");
    expect(typeof timing.task_id).toBe("number");
    expect(typeof timing.time).toBe("number");
    expect(typeof timing.created_at).toBe("string");
  });

  it("should allow valid timing data", () => {
    const validTimings: Timing[] = [
      {
        timing_id: 1,
        task_id: 1,
        time: 0,
        created_at: "2023-01-01T00:00:00Z",
      },
      {
        timing_id: 999,
        task_id: 999,
        time: 86400, // 24 hours in seconds
        created_at: "2023-12-31T23:59:59Z",
      },
      {
        timing_id: 100,
        task_id: 50,
        time: 1800, // 30 minutes in seconds
        created_at: "2023-06-15T12:30:00Z",
      },
    ];

    validTimings.forEach(timing => {
      expect(timing).toBeDefined();
      expect(timing.timing_id).toBeGreaterThan(0);
      expect(timing.task_id).toBeGreaterThan(0);
      expect(timing.time).toBeGreaterThanOrEqual(0);
      expect(timing.created_at.length).toBeGreaterThan(0);
    });
  });

  it("should handle different time formats", () => {
    const timing: Timing = {
      timing_id: 1,
      task_id: 1,
      time: 3600,
      created_at: "2023-01-01",
    };

    expect(timing.created_at).toBe("2023-01-01");
  });
});
