import { generateReportHTML } from "../../../utils/pdfReportService";
import { Project } from "../../../interfaces/Project";

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

    it("includes task summary rows with correct data", () => {
      const result = generateReportHTML(
        mockProject,
        startDate,
        endDate,
        mockTimings,
        documentName
      );

      // Check for completed task
      expect(result).toContain("Task 1");
      expect(result).toContain("01:00:00");

      // Check for incomplete task
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
      expect(result).toContain("Resumo Financeiro");
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

    it("includes proper HTML structure and dark theme styling", () => {
      const result = generateReportHTML(
        mockProject,
        startDate,
        endDate,
        mockTimings,
        documentName
      );

      expect(result).toContain("<style>");
      expect(result).toContain("--primary: #3b82f6");
      expect(result).toContain("--success: #10b981");
      expect(result).toContain("--neutral-50: #0f172a");
      expect(result).toContain("--neutral-100: #1e293b");
      expect(result).toContain("--white: #ffffff");
      expect(result).toContain("--black: #000000");
      expect(result).toContain("font-family: \"Inter\"");
      expect(result).toContain("</style>");
    });

    it("includes simplified table headers for task summary", () => {
      const result = generateReportHTML(
        mockProject,
        startDate,
        endDate,
        mockTimings,
        documentName
      );

      expect(result).toContain("<th>Tarefa</th>");
      expect(result).toContain("<th>Sessões</th>");
      expect(result).toContain("<th>Tempo Total</th>");
      expect(result).toContain("<th>Custo</th>");
    });

    it("formats dates correctly in project details", () => {
      const result = generateReportHTML(
        mockProject,
        startDate,
        endDate,
        mockTimings,
        documentName
      );

      expect(result).toContain("01/12/2023"); // Date from project created_at
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

    it("includes only essential summary cards", () => {
      const result = generateReportHTML(
        mockProject,
        startDate,
        endDate,
        mockTimings,
        documentName
      );

      expect(result).toContain("Tempo Total");
      expect(result).toContain("Taxa de Conclusão");
      
      // Should not contain removed cards
      expect(result).not.toContain("Sessão Média");
      expect(result).not.toContain("Dia Mais Produtivo");
    });

    it("includes task summary table with correct columns", () => {
      const result = generateReportHTML(
        mockProject,
        startDate,
        endDate,
        mockTimings,
        documentName
      );

      expect(result).toContain("<th>Tarefa</th>");
      expect(result).toContain("<th>Sessões</th>");
      expect(result).toContain("<th>Tempo Total</th>");
      expect(result).toContain("<th>Custo</th>");
    });

    it("applies correct CSS classes for completed and pending tasks", () => {
      const result = generateReportHTML(
        mockProject,
        startDate,
        endDate,
        mockTimings,
        documentName
      );

      expect(result).toContain("completed-task");
      expect(result).toContain("pending-task");
    });

    it("does not include detailed sessions section", () => {
      const result = generateReportHTML(
        mockProject,
        startDate,
        endDate,
        mockTimings,
        documentName
      );

      expect(result).not.toContain("Detalhamento de Sessões");
      expect(result).not.toContain("page-break");
    });

    it("calculates project summary statistics correctly", () => {
      const result = generateReportHTML(
        mockProject,
        startDate,
        endDate,
        mockTimings,
        documentName
      );

      // Should show 3 total sessions
      expect(result).toContain("3 sessões");
      // Should show 2 completed tasks out of 3 total tasks
      expect(result).toContain("2/3 tarefas");
    });

    it("handles edge case with zero hourly cost", () => {
      const freeProject: Project = {
        ...mockProject,
        hourly_cost: 0.0,
      };

      const result = generateReportHTML(
        freeProject,
        startDate,
        endDate,
        [mockTimings[0]], // 1 hour
        documentName
      );

      expect(result).toContain("R$ 0.00"); // Project info
      expect(result).toContain("R$ 0"); // Total cost
    });

    it("includes proper CSS variables for dark theme design", () => {
      const result = generateReportHTML(
        mockProject,
        startDate,
        endDate,
        mockTimings,
        documentName
      );

      // Check for dark theme CSS variables
      expect(result).toContain("--primary: #3b82f6");
      expect(result).toContain("--success: #10b981");
      expect(result).toContain("--warning: #f59e0b");
      expect(result).toContain("--neutral-50: #0f172a");
      expect(result).toContain("--neutral-100: #1e293b");
      expect(result).toContain("--white: #ffffff");
      expect(result).toContain("--black: #000000");
      
      // Should not contain old light theme variables
      expect(result).not.toContain("--neutral-50: #f8fafc");
      expect(result).not.toContain("--neutral-100: #f1f5f9");
    });

    it("includes proper print media queries for dark theme", () => {
      const result = generateReportHTML(
        mockProject,
        startDate,
        endDate,
        mockTimings,
        documentName
      );

      expect(result).toContain("@media print");
      expect(result).toContain("font-size: 12px");
      expect(result).toContain("background-color: var(--black)");
    });

    it("only shows tasks recorded during the specified period", () => {
      const result = generateReportHTML(
        mockProject,
        startDate,
        endDate,
        mockTimings,
        documentName
      );

      // Should only contain the 3 tasks from the mock timings
      expect(result).toContain("Task 1");
      expect(result).toContain("Task 2");
      expect(result).toContain("Task 3");
      
      // Should not contain any other tasks
      expect(result).not.toContain("Task 4");
      expect(result).not.toContain("Task 5");
    });

    it("applies dark theme colors correctly", () => {
      const result = generateReportHTML(
        mockProject,
        startDate,
        endDate,
        mockTimings,
        documentName
      );

      // Check for dark theme background
      expect(result).toContain("background-color: var(--neutral-50)");
      expect(result).toContain("background: var(--neutral-100)");
      
      // Check for dark theme text colors
      expect(result).toContain("color: var(--white)");
      expect(result).toContain("color: var(--neutral-900)");
    });

    it("removes all session detail related code", () => {
      const result = generateReportHTML(
        mockProject,
        startDate,
        endDate,
        mockTimings,
        documentName
      );

      // Should not contain session detail related elements
      expect(result).not.toContain("status-dot");
      expect(result).not.toContain("status-cell");
      expect(result).not.toContain("session-date");
      expect(result).not.toContain("session-duration");
      expect(result).not.toContain("total-row");
    });
  });
});