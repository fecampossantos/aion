import { useState, useCallback, useEffect } from "react";
import { Alert } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { Project } from "../../interfaces/Project";
import {
  populateDatabase,
  clearDatabase,
  getDatabaseStats,
} from "../../utils/databaseUtils";

/**
 * Custom hook for managing database operations
 * @returns {Object} Database management functions and state
 */
export const useDatabaseManagement = () => {
  const database = useSQLiteContext();
  const [projects, setProjects] = useState<Array<Project>>([]);
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
   * Refreshes the projects data from the database
   */
  const refreshProjects = useCallback(async () => {
    await fetchAllProjects();
  }, [database]);

  // Fetch projects on mount
  useEffect(() => {
    fetchAllProjects();
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
