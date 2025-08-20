import { useState, useEffect } from "react";
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPopulating, setIsPopulating] = useState<boolean>(false);
  const [isClearing, setIsClearing] = useState<boolean>(false);

  /**
   * Fetches all projects from the database
   */
  const fetchAllProjects = async () => {
    const p = await database.getAllAsync<Project>("SELECT * FROM projects;");
    setProjects(p);
  };

  useEffect(() => {
    fetchAllProjects();
    setIsLoading(false);
  }, []);

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
              await fetchAllProjects();
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
              await fetchAllProjects();
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
    isLoading,
    isPopulating,
    isClearing,
    fetchAllProjects,
    handlePopulateDatabase,
    handleClearDatabase,
  };
};
