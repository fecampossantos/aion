import { getInitOfDay, getEndOfDay, prepareResultSet } from "../../../app/ProjectInfo/utils";

describe("ProjectInfo Utils", () => {
  describe("getInitOfDay", () => {
    it("returns start of day in correct format", () => {
      const testDate = new Date("2023-12-01T15:30:45.123Z");
      const result = getInitOfDay(testDate);
      
      // Test that it returns the expected format
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
      expect(result.length).toBe(19); // YYYY-MM-DD HH:MM:SS
    });

    it("handles different dates correctly", () => {
      const testDate = new Date("2024-02-29T12:00:00.000Z"); // Leap year
      const result = getInitOfDay(testDate);
      
      // Test that it returns a valid format
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
      expect(result.includes("2024-02")).toBeTruthy(); // Should contain the year and month
    });

    it("resets time to start of day", () => {
      const testDate = new Date("2023-06-15T12:34:56.789Z");
      const result = getInitOfDay(testDate);
      
      // Test that the time part is consistent (should be start of day in UTC)
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
      expect(result).not.toContain("12:34:56");
    });

    it("preserves the original date object", () => {
      const testDate = new Date("2023-12-01T15:30:45.123Z");
      const originalTime = testDate.getTime();
      
      getInitOfDay(testDate);
      
      expect(testDate.getTime()).toBe(originalTime);
    });
  });

  describe("getEndOfDay", () => {
    it("returns end of day in correct format", () => {
      const testDate = new Date("2023-12-01T10:30:45.123Z");
      const result = getEndOfDay(testDate);
      
      // Test that it returns the expected format
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
      expect(result.length).toBe(19); // YYYY-MM-DD HH:MM:SS
    });

    it("handles different dates correctly", () => {
      const testDate = new Date("2024-01-01T12:00:00.000Z");
      const result = getEndOfDay(testDate);
      
      // Test that it returns a valid format
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
      expect(result.includes("2024-01")).toBeTruthy(); // Should contain the year and month
    });

    it("sets time to end of day", () => {
      const testDate = new Date("2023-06-15T12:34:56.789Z");
      const result = getEndOfDay(testDate);
      
      // Test that the time part is consistent (should be end of day in UTC)
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
      expect(result).not.toContain("12:34:56");
    });

    it("preserves the original date object", () => {
      const testDate = new Date("2023-12-01T15:30:45.123Z");
      const originalTime = testDate.getTime();
      
      getEndOfDay(testDate);
      
      expect(testDate.getTime()).toBe(originalTime);
    });
  });

  describe("prepareResultSet", () => {
    it("transforms data correctly", () => {
      const input = [
        { day: "2023-12-01", total_time: 3600 }, // 1 hour = 60 minutes
        { day: "2023-12-02", total_time: 1800 }, // 30 minutes
        { day: "2023-12-03", total_time: 900 },  // 15 minutes
      ];

      const result = prepareResultSet(input);

      expect(result.labels).toEqual(["01/12/2023", "02/12/2023", "03/12/2023"]);
      expect(result.datasets).toEqual([{ data: [60, 30, 15] }]);
    });

    it("handles empty array", () => {
      const result = prepareResultSet([]);

      expect(result.labels).toEqual([]);
      expect(result.datasets).toEqual([{ data: [] }]);
    });

    it("handles single item", () => {
      const input = [{ day: "2023-01-15", total_time: 7200 }]; // 2 hours = 120 minutes

      const result = prepareResultSet(input);

      expect(result.labels).toEqual(["15/01/2023"]);
      expect(result.datasets).toEqual([{ data: [120] }]);
    });

    it("converts seconds to minutes correctly", () => {
      const input = [
        { day: "2023-12-01", total_time: 60 },   // 1 minute
        { day: "2023-12-02", total_time: 120 },  // 2 minutes
        { day: "2023-12-03", total_time: 0 },    // 0 minutes
      ];

      const result = prepareResultSet(input);

      expect(result.datasets[0].data).toEqual([1, 2, 0]);
    });

    it("formats dates from YYYY-MM-DD to DD/MM/YYYY", () => {
      const input = [
        { day: "2023-01-05", total_time: 60 },
        { day: "2023-12-25", total_time: 120 },
      ];

      const result = prepareResultSet(input);

      expect(result.labels).toEqual(["05/01/2023", "25/12/2023"]);
    });

    it("handles fractional minutes", () => {
      const input = [
        { day: "2023-12-01", total_time: 90 },  // 1.5 minutes
        { day: "2023-12-02", total_time: 45 },  // 0.75 minutes
      ];

      const result = prepareResultSet(input);

      expect(result.datasets[0].data).toEqual([1.5, 0.75]);
    });

    it("maintains order of input data", () => {
      const input = [
        { day: "2023-12-03", total_time: 180 },
        { day: "2023-12-01", total_time: 60 },
        { day: "2023-12-02", total_time: 120 },
      ];

      const result = prepareResultSet(input);

      expect(result.labels).toEqual(["03/12/2023", "01/12/2023", "02/12/2023"]);
      expect(result.datasets[0].data).toEqual([3, 1, 2]);
    });
  });
});