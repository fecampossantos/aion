import { generateReportHTML } from "../../../utils/pdfReportService";
import { Project } from "../../interfaces/Project";

describe("PDF Report Service", () => {
  const mockProject: Project = {
    project_id: 1,
    name: "Test Project",
    hourly_cost: 50.0,
    created_at: new Date("2023-12-01"),
  };

  const mockTimings = [
    {
      task_completed: 1 as const,
      timing_created_at: "2023-12-01T10:00:00",
      task_name: "Task 1",
      timing_timed: 3600, // 1 hour
    },
    {
      task_completed: 0 as const,
      timing_created_at: "2023-12-01T14:00:00",
      task_name: "Task 2",
      timing_timed: 1800, // 30 minutes
    },
    {
      task_completed: 1 as const,
      timing_created_at: "2023-12-02T09:00:00",
      task_name: "Task 3",
      timing_timed: 900, // 15 minutes
    },
  ];

  const startDate = "01/12/2023";
  const endDate = "02/12/2023";
  const documentName = "Test Report";

  describe("generateReportHTML", () => {
    it("generates HTML report with correct structure", () => {
      const result = generateReportHTML(
        mockProject,
        startDate,
        endDate,
        mockTimings,
        documentName
      );

      expect(result).toContain("<!DOCTYPE html>");
      expect(result).toContain("<html lang=\"pt-br\">");
      expect(result).toContain("<title>Test Report</title>");
      expect(result).toContain("</html>");
    });

    it("includes project information", () => {
      const result = generateReportHTML(
        mockProject,
        startDate,
        endDate,
        mockTimings,
        documentName
      );

      expect(result).toContain("Test Project");
      expect(result).toContain("R$ 50.00");
      expect(result).toContain("01/12/2023 - 02/12/2023");
    });

    it("includes task rows with correct data", () => {
      const result = generateReportHTML(
        mockProject,
        startDate,
        endDate,
        mockTimings,
        documentName
      );

      // Check for completed task (✅)
      expect(result).toContain("✅");
      expect(result).toContain("Task 1");
      expect(result).toContain("01:00:00");

      // Check for incomplete task (⏳)
      expect(result).toContain("⏳");
      expect(result).toContain("Task 2");
      expect(result).toContain("00:30:00");

      // Check for third task
      expect(result).toContain("Task 3");
      expect(result).toContain("00:15:00");
    });

    it("calculates total time correctly", () => {
      const result = generateReportHTML(
        mockProject,
        startDate,
        endDate,
        mockTimings,
        documentName
      );

      // Total: 1 hour + 30 minutes + 15 minutes = 1 hour 45 minutes
      expect(result).toContain("01:45:00");
      expect(result).toContain("TEMPO TOTAL");
    });

    it("calculates total cost correctly", () => {
      const result = generateReportHTML(
        mockProject,
        startDate,
        endDate,
        mockTimings,
        documentName
      );

      // Total time: 6300 seconds = 1.75 hours
      // Cost: 1.75 * 50 = 87.5
      expect(result).toContain("R$ 87,5");
      expect(result).toContain("💰 Resumo Financeiro");
    });

    it("handles empty timings array", () => {
      const result = generateReportHTML(
        mockProject,
        startDate,
        endDate,
        [],
        documentName
      );

      expect(result).toContain("00:00:00"); // Total time should be 0
      expect(result).toContain("R$ 0"); // Total cost should be 0
      expect(result).toContain("Test Project");
    });

    it("handles single timing correctly", () => {
      const singleTiming = [mockTimings[0]];
      const result = generateReportHTML(
        mockProject,
        startDate,
        endDate,
        singleTiming,
        documentName
      );

      expect(result).toContain("Task 1");
      expect(result).toContain("01:00:00");
      expect(result).toContain("R$ 50"); // 1 hour * $50/hour
    });

    it("includes proper HTML structure and styling", () => {
      const result = generateReportHTML(
        mockProject,
        startDate,
        endDate,
        mockTimings,
        documentName
      );

      expect(result).toContain("<style>");
      expect(result).toContain("--primary-color: #2563eb");
      expect(result).toContain("--success-color: #059669");
      expect(result).toContain("--gray-900: #111827");
      expect(result).toContain("font-family: \"Inter\"");
      expect(result).toContain("</style>");
    });

    it("includes table headers", () => {
      const result = generateReportHTML(
        mockProject,
        startDate,
        endDate,
        mockTimings,
        documentName
      );

      expect(result).toContain("<th>Status</th>");
      expect(result).toContain("<th>Tarefa</th>");
      expect(result).toContain("<th>Data</th>");
      expect(result).toContain("<th>Duração</th>");
    });

    it("formats dates correctly in task rows", () => {
      const result = generateReportHTML(
        mockProject,
        startDate,
        endDate,
        mockTimings,
        documentName
      );

      expect(result).toContain("01/12/2023"); // Date from timing_created_at
      expect(result).toContain("02/12/2023");
    });

    it("handles different hourly costs", () => {
      const expensiveProject: Project = {
        ...mockProject,
        hourly_cost: 100.0,
      };

      const result = generateReportHTML(
        expensiveProject,
        startDate,
        endDate,
        [mockTimings[0]], // 1 hour
        documentName
      );

      expect(result).toContain("R$ 100.00"); // Project info
      expect(result).toContain("R$ 100"); // Total cost (1 hour * $100/hour)
    });

    it("handles fractional costs correctly", () => {
      const fractionalProject: Project = {
        ...mockProject,
        hourly_cost: 33.33,
      };

      const result = generateReportHTML(
        fractionalProject,
        startDate,
        endDate,
        [mockTimings[0]], // 1 hour
        documentName
      );

      expect(result).toContain("R$ 33.33"); // Project info
    });
  });
});