import { useState, useEffect, useCallback } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { ConfirmationModal } from "../../components/Modal";
import { Project as IProject } from "../../interfaces/Project";

interface TaskWithTimed {
  task_id: number;
  name: string;
  completed: 0 | 1;
  task_created_at: string;
  timed_until_now: number;
}

/**
 * Custom hook for managing project functionality with task name search and pagination
 * @param {string} projectID - The project ID
 * @returns {Object} Project state and functions
 */
const useProject = (projectID: string) => {
  const database = useSQLiteContext();
  const navigation = useNavigation();
  const router = useRouter();

  // Check if database context is available
  if (!database) {
    throw new Error("Database context not available");
  }

  const [tasks, setTasks] = useState<Array<TaskWithTimed>>([]);
  const [filteredTasks, setFilteredTasks] = useState<Array<TaskWithTimed>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [timerIdRunning, setTimerIdRunning] = useState<number | null>(null);
  const [project, setProject] = useState<IProject>();
  
  // Search, filter, and pagination state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showCompleted, setShowCompleted] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);

  // Modal state for timer warning
  const [showTimerWarningModal, setShowTimerWarningModal] = useState<boolean>(false);

  const isTimerRunning = timerIdRunning !== null;

  // Fetch data when screen comes into focus (handles both initial load and refresh)
  useFocusEffect(
    useCallback(() => {
      if (projectID) {
        setIsLoading(true);
        async function fetchData() {
          try {
            const project = await database.getFirstAsync<IProject>(
              `SELECT * FROM projects WHERE project_id = ?;`,
              projectID
            );

            setProject(project);
            
            // Fetch tasks
            const allTasks = await database.getAllAsync<TaskWithTimed>(
              `SELECT 
    t.task_id,
    t.name,
    t.completed,
    t.created_at AS task_created_at,
    COALESCE(SUM(ti.time), 0) AS timed_until_now
  FROM 
    tasks t
  LEFT JOIN 
    timings ti ON t.task_id = ti.task_id
  WHERE 
    t.project_id = ?
  GROUP BY 
    t.task_id, t.name, t.completed, t.created_at
  ORDER BY 
    t.created_at;`,
              projectID
            );

            setTasks(allTasks);
            setFilteredTasks(allTasks);
          } catch (error) {
            // Set project to null on error
            setProject(null);
            setTasks([]);
            setFilteredTasks([]);
          } finally {
            setIsLoading(false);
          }
        }

        fetchData();
      }
    }, [projectID, database])
  );

  // Reset state when projectID changes
  useEffect(() => {
    setTasks([]);
    setFilteredTasks([]);
    setTimerIdRunning(null);
    setCurrentPage(1);
    setSearchQuery("");
    setShowCompleted(false);
  }, [projectID]);

  /**
   * Filters tasks based on search query and show completed preference
   * @param {string} query - The search query string to match against task names
   */
  const filterTasks = useCallback((query: string) => {
    let filtered = tasks;

    // Filter by completion status
    // When showCompleted is false (default), show only incomplete tasks (completed === 0)
    // When showCompleted is true (toggled), show all tasks (both completed and incomplete)
    if (!showCompleted) {
      filtered = filtered.filter((task) => task.completed === 0);
    }
    // If showCompleted is true, we don't filter - show all tasks

    // Filter by search query
    if (query.trim()) {
      const searchLower = query.toLowerCase();
      filtered = filtered.filter((task) =>
        task.name.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredTasks(filtered);
    setCurrentPage(1);
  }, [tasks, showCompleted]);

  // Re-filter tasks when showCompleted or tasks change
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      filterTasks(searchQuery);
    }
  }, [filterTasks, searchQuery, showCompleted]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", () => {
      if (!isTimerRunning) return;

      setShowTimerWarningModal(true);
    });

    return unsubscribe;
  }, [navigation, isTimerRunning]);

  /**
   * Handles confirming navigation away while timer is running
   */
  const handleConfirmNavigation = () => {
    setShowTimerWarningModal(false);
    router.replace("/");
  };

  /**
   * Handles canceling navigation away while timer is running
   */
  const handleCancelNavigation = () => {
    setShowTimerWarningModal(false);
  };

  /**
   * Fetches all tasks for the project
   */
  const getTasks = async () => {
    try {
      const allTasks = await database.getAllAsync<TaskWithTimed>(
        `SELECT 
  t.task_id,
  t.name,
  t.completed,
  t.created_at AS task_created_at,
  COALESCE(SUM(ti.time), 0) AS timed_until_now
FROM 
  tasks t
LEFT JOIN 
  timings ti ON t.task_id = ti.task_id
WHERE 
  t.project_id = ?
GROUP BY 
  t.task_id, t.name, t.completed, t.created_at
ORDER BY 
  t.created_at;`,
        projectID
      );

      setTasks(allTasks);
      setFilteredTasks(allTasks);
    } catch (error) {
      // Set tasks to undefined on error
      setTasks(undefined);
      setFilteredTasks(undefined);
    }
  };

  // Initial tasks fetch is now handled in useFocusEffect
  // This useEffect is no longer needed as tasks are fetched when screen comes into focus

  // Cleanup effect to reset timer state on unmount
  useEffect(() => {
    return () => {
      setTimerIdRunning(null);
      setTasks([]);
      setIsLoading(false);
    };
  }, []);

  /**
   * Handles navigation to a specific task
   * @param {TaskWithTimed} task - The task to navigate to
   */
  const handleNavigateToTask = (task: TaskWithTimed) => {
    if (isTimerRunning) return;
    router.push({
      pathname: "/Task",
      params: { taskID: task.task_id, taskName: task.name, projectID },
    });
  };

  /**
   * Handles marking a task as done or undone
   * @param {boolean} value - Whether the task is completed
   * @param {TaskWithTimed} task - The task to update
   */
  const handleDoneTask = async (value: boolean, task: TaskWithTimed) => {
    const toInsert = value ? 1 : 0;

    await database.runAsync(
      "UPDATE tasks SET completed = ? WHERE task_id = ?;",
      toInsert,
      task.task_id
    );
    getTasks();
  };

  /**
   * Handles search query changes
   * @param {string} query - The new search query
   */
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    filterTasks(query);
  };

  /**
   * Handles show completed toggle
   * @param {boolean} value - Whether to show completed tasks
   */
  const handleShowCompletedToggle = (value: boolean) => {
    setShowCompleted(value);
    filterTasks(searchQuery);
  };

  /**
   * Gets paginated tasks for the current page
   * @returns {Array<TaskWithTimed>} Array of tasks for the current page
   */
  const getPaginatedTasks = (): Array<TaskWithTimed> => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTasks.slice(startIndex, endIndex);
  };

  /**
   * Gets the total number of pages
   * @returns {number} Total number of pages
   */
  const getTotalPages = (): number => {
    return Math.ceil(filteredTasks.length / itemsPerPage);
  };

  /**
   * Goes to the next page
   */
  const goToNextPage = () => {
    if (currentPage < getTotalPages()) {
      setCurrentPage(currentPage + 1);
    }
  };

  /**
   * Goes to the previous page
   */
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  /**
   * Goes to a specific page
   * @param {number} page - The page number to go to
   */
  const goToPage = (page: number) => {
    if (page >= 1 && page <= getTotalPages()) {
      setCurrentPage(page);
    }
  };

  return {
    tasks,
    filteredTasks,
    isLoading,
    timerIdRunning,
    project,
    isTimerRunning,
    searchQuery,
    showCompleted,
    currentPage,
    itemsPerPage,
    showTimerWarningModal,
    getTasks,
    getPaginatedTasks,
    getTotalPages,
    goToNextPage,
    goToPreviousPage,
    goToPage,
    handleSearchChange,
    handleShowCompletedToggle,
    handleNavigateToTask,
    handleDoneTask,
    handleConfirmNavigation,
    handleCancelNavigation,
  };
};

export default useProject;
