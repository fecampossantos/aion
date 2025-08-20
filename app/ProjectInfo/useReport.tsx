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
    getProject,
    startDate,
    endDate,
    handleClickedOnDeleteProject,
    handleShowDatePicker,
    resultSet,
    showDatePicker,
    datePickerValue,
    handleUpdateDate,
    dateShown,
    project,
    showChart,
    // Modal state and handlers
    showDeleteModal,
    deleteProjectInput,
    setDeleteProjectInput,
    handleConfirmDelete,
    handleCancelDelete,
  };
};

export default useReport;
