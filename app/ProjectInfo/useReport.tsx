import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import { Project as IProject } from "../../interfaces/Project";
import { getEndOfDay, getInitOfDay, prepareResultSet } from "./utils";

const useReport = (projectID: string) => {
  const database = useSQLiteContext();
  const [startDate, setStartDate] = useState(() => {
    const currentDate = new Date();
    const sevenDaysAgo = new Date(currentDate);
    sevenDaysAgo.setDate(currentDate.getDate() - 7);

    return sevenDaysAgo;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerValue, setDatePickerValue] = useState(null);
  const [dateShown, setDateShown] = useState<"start" | "end" | null>(null);
  const [resultSet, setResultSet] = useState<{
    labels: Array<string>;
    datasets: Array<{ data: Array<number> }>;
  } | null>();
  const [showChart, setShowChart] = useState(false);
  const [burndownData, setBurndownData] = useState<{
    labels: Array<string>;
    datasets: Array<{
      data: Array<number>;
      color?: (opacity: number) => string;
      strokeWidth?: number;
    }>;
  } | null>();
  const [showBurndownChart, setShowBurndownChart] = useState(false);

  const [project, setProject] = useState<IProject>();

  // Modal state for delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteProjectInput, setDeleteProjectInput] = useState("");

  async function getProject() {
    const project = await database.getFirstAsync<IProject>(
      `SELECT * FROM projects WHERE project_id = ?;`,
      projectID as string
    );

    setProject(project);
  }

  async function getTimings() {
    const query = `SELECT 
            DATE(t.created_at) AS day,
            SUM(t.time) AS total_time
        FROM 
            timings t
        JOIN 
            tasks tk ON t.task_id = tk.task_id
        WHERE 
            tk.project_id = ?
            AND t.created_at BETWEEN ? AND ?
        GROUP BY 
            day
        ORDER BY 
            day;`;

    try {
      const result = await database.getAllAsync<{
        day: string;
        total_time: number;
      }>(query, projectID, getInitOfDay(startDate), getEndOfDay(endDate));
      setResultSet(prepareResultSet(result));
      setShowChart(true);
    } catch (e) {
      console.warn(e);
    }
  }

  async function getBurndownData() {
    try {
      // Get all tasks for the project with their creation and completion dates
      const tasksQuery = `
        SELECT 
          tk.task_id,
          tk.name,
          tk.completed,
          DATE(tk.created_at) as created_date,
          CASE 
            WHEN tk.completed = 1 THEN (
              SELECT DATE(t.created_at) 
              FROM timings t 
              WHERE t.task_id = tk.task_id 
              ORDER BY t.created_at DESC 
              LIMIT 1
            )
            ELSE NULL
          END as completed_date
        FROM tasks tk
        WHERE tk.project_id = ?
        ORDER BY tk.created_at;
      `;

      const tasks = await database.getAllAsync<{
        task_id: number;
        name: string;
        completed: 0 | 1;
        created_date: string;
        completed_date: string | null;
      }>(tasksQuery, projectID);

      if (tasks.length === 0) {
        setShowBurndownChart(false);
        return;
      }

      // Create date range from project start to end date
      const projectStartDate = new Date(
        Math.min(...tasks.map((t) => new Date(t.created_date).getTime()))
      );
      const dateRange: Date[] = [];
      const currentDate = new Date(projectStartDate);

      while (currentDate <= endDate) {
        dateRange.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Calculate ideal and actual burndown
      const totalTasks = tasks.length;
      const labels = dateRange.map((date) => {
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return `${day}/${month}`;
      });

      const idealBurndown: number[] = [];
      const actualBurndown: number[] = [];

      dateRange.forEach((date, index) => {
        const dateStr = date.toISOString().split("T")[0];

        // Ideal burndown (linear decrease)
        const daysFromStart = index;
        const totalDays = dateRange.length - 1;
        const idealRemaining =
          totalDays > 0
            ? Math.max(0, totalTasks - (totalTasks * daysFromStart) / totalDays)
            : totalTasks;
        idealBurndown.push(Math.round(idealRemaining));

        // Actual burndown (tasks remaining based on completion dates)
        const completedByDate = tasks.filter(
          (task) =>
            task.completed === 1 &&
            task.completed_date &&
            task.completed_date <= dateStr
        ).length;

        actualBurndown.push(totalTasks - completedByDate);
      });

      setBurndownData({
        labels: labels,
        datasets: [
          {
            data: idealBurndown,
            color: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`, // gray for ideal
            strokeWidth: 2,
          },
          {
            data: actualBurndown,
            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // blue for actual
            strokeWidth: 3,
          },
        ],
      });
      setShowBurndownChart(true);
    } catch (e) {
      console.warn("Error generating burndown data:", e);
      setShowBurndownChart(false);
    }
  }

  /**
   * Handles the actual deletion of the project
   */
  const handleDeleteProject = () => {
    database.runAsync("DELETE FROM projects WHERE project_id = ?;", projectID);
    router.replace("/");
  };

  /**
   * Shows the delete confirmation modal
   */
  const handleClickedOnDeleteProject = () => {
    setShowDeleteModal(true);
    setDeleteProjectInput("");
  };

  /**
   * Handles the delete confirmation with project name validation
   */
  const handleConfirmDelete = () => {
    if (project && deleteProjectInput === project.name) {
      handleDeleteProject();
    }
  };

  /**
   * Closes the delete modal and resets input
   */
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteProjectInput("");
  };

  const handleUpdateDate = (event, selectedDate) => {
    if (event.type !== "set") return;
    if (dateShown === "start") {
      setStartDate(new Date(selectedDate));
    } else {
      setEndDate(new Date(selectedDate));
    }
    setShowDatePicker(false);
  };

  const handleShowDatePicker = (dateValue: "start" | "end") => {
    setDateShown(dateValue);
    setDatePickerValue(dateValue === "start" ? startDate : endDate);
    setShowDatePicker(true);
  };

  return {
    getTimings,
    getBurndownData,
    getProject,
    startDate,
    endDate,
    handleClickedOnDeleteProject,
    handleShowDatePicker,
    resultSet,
    burndownData,
    showDatePicker,
    datePickerValue,
    handleUpdateDate,
    dateShown,
    project,
    showChart,
    showBurndownChart,
    // Modal state and handlers
    showDeleteModal,
    deleteProjectInput,
    setDeleteProjectInput,
    handleConfirmDelete,
    handleCancelDelete,
  };
};

export default useReport;
