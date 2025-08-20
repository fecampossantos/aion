import { useState, useCallback, useEffect } from "react";
import { Alert } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { Project } from "../../interfaces/Project";
import {
  populateDatabase,
  clearDatabase,
  getDatabaseStats,
} from "../../utils/databaseUtils";

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
export const useDatabaseManagement = () => {
  const database = useSQLiteContext();
  const [projects, setProjects] = useState<Array<Project>>([]);
  const [lastWorkedTask, setLastWorkedTask] = useState<LastWorkedTask | null>(null);
  const [filteredProjects, setFilteredProjects] = useState<Array<Project>>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPopulating, setIsPopulating] = useState<boolean>(false);
  const [isClearing, setIsClearing] = useState<boolean>(false);

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
  const fetchAllProjects = async () => {
    try {
      setIsLoading(true);
      const p = await database.getAllAsync<Project>("SELECT * FROM projects;");
      setProjects(p);
      setFilteredProjects(p);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetches the last worked task based on the most recent timing entry
   */
  const fetchLastWorkedTask = async () => {
    try {
      // First check if there are any timings at all
      const hasTimings = await database.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM timings;"
      );
      
      if (!hasTimings || hasTimings.count === 0) {
        setLastWorkedTask(null);
        return;
      }

      const query = `
        SELECT 
          t.task_id,
          t.name,
          t.completed,
          t.created_at as task_created_at,
          COALESCE(SUM(tim.time), 0) as timed_until_now,
          t.project_id,
          p.name as project_name,
          MAX(tim.created_at) as last_timing_date
        FROM tasks t
        JOIN projects p ON t.project_id = p.project_id
        JOIN timings tim ON t.task_id = tim.task_id
        GROUP BY t.task_id, t.name, t.completed, t.created_at, t.project_id, p.name
        ORDER BY last_timing_date DESC
        LIMIT 1;
      `;
      
      const result = await database.getFirstAsync<LastWorkedTask>(query);
      setLastWorkedTask(result || null);
    } catch (error) {
      console.error("Error fetching last worked task:", error);
      setLastWorkedTask(null);
    }
  };

  /**
   * Refreshes the projects data from the database
   */
  const refreshProjects = useCallback(async () => {
    await fetchAllProjects();
    await fetchLastWorkedTask();
  }, [database]);

  // Fetch projects and last worked task on mount
  useEffect(() => {
    fetchAllProjects();
    fetchLastWorkedTask();
  }, []);

  // Update filtered projects when projects change
  useEffect(() => {
    filterProjects(searchQuery);
  }, [projects, filterProjects, searchQuery]);

  /**
   * Handles populating the database with sample data
   */
  const handlePopulateDatabase = async () => {
    Alert.alert(
      "Populate Database",
      "This will add 2 projects with extensive tasks and 2 months of time tracking data. This may take a few seconds.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Populate",
          onPress: async () => {
            setIsPopulating(true);
            try {
              await populateDatabase(database);
              await refreshProjects();
              const stats = await getDatabaseStats(database);
              Alert.alert(
                "Success!",
                `Database populated successfully!\n\nAdded:\n• ${stats.projects} projects\n• ${stats.tasks} tasks\n• ${stats.timings} time entries`
              );
            } catch (error) {
              Alert.alert(
                "Error",
                "Failed to populate database. Please try again."
              );
              console.error("Population error:", error);
            } finally {
              setIsPopulating(false);
            }
          },
        },
      ]
    );
  };

  /**
   * Handles clearing all data from the database
   */
  const handleClearDatabase = async () => {
    Alert.alert(
      "Clear Database",
      "This will permanently delete ALL projects, tasks, and time tracking data. This action cannot be undone!",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            setIsClearing(true);
            try {
              await clearDatabase(database);
              await refreshProjects();
              Alert.alert("Success!", "Database cleared successfully!");
            } catch (error) {
              Alert.alert(
                "Error",
                "Failed to clear database. Please try again."
              );
              console.error("Clear error:", error);
            } finally {
              setIsClearing(false);
            }
          },
        },
      ]
    );
  };

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
    handleClearDatabase,
    handleSearch,
    clearSearch,
  };
};
