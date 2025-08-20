import { useState, useCallback, useEffect } from "react";
import { Alert } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { Project } from "../../interfaces/Project";
import {
  populateDatabase,
  clearDatabase,
  getDatabaseStats,
} from "../../utils/databaseUtils";
import {
  downloadBackup,
  restoreFromFile,
  getBackupStats,
  BackupData,
} from "../../utils/backupUtils";

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
  const [isBackingUp, setIsBackingUp] = useState<boolean>(false);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);

  /**
   * Fetches all projects from the database
   */
  const fetchAllProjects = async () => {
    try {
      setIsLoading(true);
      const p = await database.getAllAsync<Project>("SELECT * FROM projects;");
      setProjects(p);
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

  /**
   * Handles creating and downloading a backup of all data
   */
  const handleBackupData = async () => {
    Alert.alert(
      "Create Backup",
      "This will create a backup file with all your projects, tasks, and time tracking data. The file will be saved to your device.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Create Backup",
          onPress: async () => {
            setIsBackingUp(true);
            try {
              await downloadBackup(database);
              Alert.alert(
                "Backup Complete",
                "Your data has been successfully backed up and saved to your device. You can now share or store this file safely."
              );
            } catch (error) {
              Alert.alert(
                "Backup Failed",
                `Failed to create backup: ${error instanceof Error ? error.message : 'Unknown error'}`
              );
              console.error("Backup error:", error);
            } finally {
              setIsBackingUp(false);
            }
          },
        },
      ]
    );
  };

  /**
   * Handles restoring data from a backup file
   * Note: For now, this is a placeholder. In a full implementation,
   * you would add expo-document-picker to select backup files
   */
  const handleRestoreData = async () => {
    Alert.alert(
      "Restore Data",
      "To restore your data from a backup file:\n\n1. Make sure you have a backup file (.json) saved on your device\n2. Contact support or use the file manager approach\n\nNote: This will replace ALL current data!",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Learn More",
          onPress: () => {
            Alert.alert(
              "Restore Instructions",
              "To restore data:\n\n1. Create a backup first (recommended)\n2. Place your backup file in the app's document directory\n3. The restore feature will be available in a future update with file picker support\n\nFor now, you can use the backup feature to save your data safely."
            );
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
    isBackingUp,
    isRestoring,
    fetchAllProjects,
    refreshProjects,
    handlePopulateDatabase,
    handleClearDatabase,
    handleBackupData,
    handleRestoreData,
  };
};
