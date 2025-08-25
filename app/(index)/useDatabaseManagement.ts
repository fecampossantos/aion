import { useState, useCallback, useEffect } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { Project } from "../../interfaces/Project";
import {
  populateDatabase,
  clearDatabase,
  getDatabaseStats,
} from "../../utils/databaseUtils";
import { useToast } from "../../components/Toast/ToastContext";

// Interface for the last worked task with project info
interface LastWorkedTask {
  task_id: number;
  name: string;
  completed: 0 | 1;
  task_created_at: string;
  timed_until_now: number;
  project_id: number;
  project_name: string;
  last_timing_date: string;
}

/**
 * Custom hook for managing database operations
 * @returns {Object} Database management functions and state
 */
const useDatabaseManagement = () => {
  const database = useSQLiteContext();
  const { showToast } = useToast();
  const [projects, setProjects] = useState<Array<Project>>([]);
  const [lastWorkedTask, setLastWorkedTask] = useState<LastWorkedTask | null>(null);
  const [filteredProjects, setFilteredProjects] = useState<Array<Project>>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPopulating, setIsPopulating] = useState<boolean>(false);
  const [isClearing, setIsClearing] = useState<boolean>(false);
  
  // Confirmation modal states
  const [showPopulateConfirmation, setShowPopulateConfirmation] = useState<boolean>(false);
  const [showClearConfirmation, setShowClearConfirmation] = useState<boolean>(false);

  /**
   * Filters projects based on search query
   * @param {string} query - Search query to filter projects by name
   */
  const filterProjects = useCallback((query: string) => {
    if (!query.trim()) {
      setFilteredProjects(projects);
      return;
    }
    
    const filtered = projects.filter((project) =>
      project.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredProjects(filtered);
  }, [projects]);

  /**
   * Handles search query changes
   * @param {string} query - New search query
   */
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    filterProjects(query);
  }, [filterProjects]);

  /**
   * Clears the search query and resets filtered projects
   */
  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setFilteredProjects(projects);
  }, [projects]);

  /**
   * Fetches all projects from the database
   */
  const fetchAllProjects = useCallback(async () => {
    try {
      const allProjects = await database.getAllAsync<Project>(
        "SELECT * FROM projects ORDER BY name ASC;"
      );
      setProjects(allProjects || []);
      setFilteredProjects(allProjects || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setProjects([]);
      setFilteredProjects([]);
    }
  }, [database]);

  /**
   * Fetches the last worked task with project information
   */
  const fetchLastWorkedTask = useCallback(async () => {
    try {
      const lastTask = await database.getFirstAsync<LastWorkedTask>(
        `SELECT 
          t.task_id,
          t.name,
          t.completed,
          t.created_at AS task_created_at,
          COALESCE(SUM(tim.time), 0) AS timed_until_now,
          t.project_id,
          p.name as project_name,
          MAX(tim.created_at) as last_timing_date
        FROM tasks t
        JOIN projects p ON t.project_id = p.project_id
        LEFT JOIN timings tim ON t.task_id = tim.task_id
        GROUP BY t.task_id, t.name, t.completed, t.created_at, t.project_id, p.name
        HAVING timed_until_now > 0
        ORDER BY last_timing_date DESC
        LIMIT 1;`
      );
      setLastWorkedTask(lastTask || null);
    } catch (error) {
      console.error("Error fetching last worked task:", error);
      setLastWorkedTask(null);
    }
  }, [database]);

  /**
   * Refreshes projects data
   */
  const refreshProjects = useCallback(async () => {
    try {
      await fetchAllProjects();
      await fetchLastWorkedTask();
    } catch (error) {
      console.error("Error refreshing projects:", error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchAllProjects, fetchLastWorkedTask]);

  /**
   * Handles populating the database with sample data
   */
  const handlePopulateDatabase = () => {
    setShowPopulateConfirmation(true);
  };

  /**
   * Handles populate confirmation
   */
  const handlePopulateConfirm = async () => {
    setShowPopulateConfirmation(false);
    setIsPopulating(true);
    try {
      await populateDatabase(database);
      await refreshProjects();
      // Show success toast
      showToast('Database populated successfully!', 'success');
    } catch (error) {
      // Show error toast
      showToast('Failed to populate database. Please try again.', 'error');
      console.error("Populate error:", error);
    } finally {
      setIsPopulating(false);
    }
  };

  /**
   * Handles clearing all data from the database
   */
  const handleClearDatabase = () => {
    setShowClearConfirmation(true);
  };

  /**
   * Handles clear confirmation
   */
  const handleClearConfirm = async () => {
    setShowClearConfirmation(false);
    setIsClearing(true);
    try {
      await clearDatabase(database);
      await refreshProjects();
      // Show success toast
      showToast('Database cleared successfully!', 'success');
    } catch (error) {
      // Show error toast
      showToast('Failed to clear database. Please try again.', 'error');
      console.error("Clear error:", error);
    } finally {
      setIsClearing(false);
    }
  };

  // Load initial data
  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  return {
    projects,
    lastWorkedTask,
    filteredProjects,
    searchQuery,
    isLoading,
    isPopulating,
    isClearing,
    fetchAllProjects,
    refreshProjects,
    handlePopulateDatabase,
    handlePopulateConfirm,
    handleClearDatabase,
    handleClearConfirm,
    handleSearch,
    clearSearch,
    // Confirmation modal states
    showPopulateConfirmation,
    setShowPopulateConfirmation,
    showClearConfirmation,
    setShowClearConfirmation,
  };
};

export default useDatabaseManagement;
