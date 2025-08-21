import { useState, useCallback, useEffect } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { Project } from "../../interfaces/Project";
import {
  populateDatabase,
  clearDatabase,
  getDatabaseStats,
} from "../../utils/databaseUtils";
import {
  downloadBackup,
  restoreFromSelectedFile,
  restoreFromFile,
  getBackupStats,
  BackupData,
} from "../../utils/backupUtils";
import {
  BackupModal,
  RestoreModal,
  RestoreConfirmationModal,
  SuccessModal,
} from "../../components/Modal";

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
  const [isBackingUp, setIsBackingUp] = useState<boolean>(false);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  
  // Modal states
  const [showBackupModal, setShowBackupModal] = useState<boolean>(false);
  const [showRestoreModal, setShowRestoreModal] = useState<boolean>(false);
  const [showRestoreConfirmationModal, setShowRestoreConfirmationModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [successModalData, setSuccessModalData] = useState<{
    title: string;
    message: string;
    details: string[];
  }>({ title: '', message: '', details: [] });
  const [restoreBackupInfo, setRestoreBackupInfo] = useState<{
    date: string;
    projectCount: number;
    taskCount: number;
    timingCount: number;
  }>({ date: '', projectCount: 0, taskCount: 0, timingCount: 0 });
  
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
      const stats = await getDatabaseStats(database);
      // Show success modal
      setSuccessModalData({
        title: 'Success!',
        message: 'Database populated successfully!',
        details: [
          `Added ${stats.projects} projects`,
          `Added ${stats.tasks} tasks`,
          `Added ${stats.timings} time entries`
        ]
      });
      setShowSuccessModal(true);
    } catch (error) {
      // Show error modal
      setSuccessModalData({
        title: 'Error',
        message: 'Failed to populate database. Please try again.',
        details: []
      });
      setShowSuccessModal(true);
      console.error("Population error:", error);
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
      // Show success modal
      setSuccessModalData({
        title: 'Success!',
        message: 'Database cleared successfully!',
        details: []
      });
      setShowSuccessModal(true);
    } catch (error) {
      // Show error modal
      setSuccessModalData({
        title: 'Error',
        message: 'Failed to clear database. Please try again.',
        details: []
      });
      setShowSuccessModal(true);
      console.error("Clear error:", error);
    } finally {
      setIsClearing(false);
    }
  };

  /**
   * Handles creating and sharing a backup of all data
   */
  const handleBackupData = () => {
    setShowBackupModal(true);
  };

  /**
   * Handles backup confirmation
   */
  const handleBackupConfirm = async () => {
    setShowBackupModal(false);
    setIsBackingUp(true);
    try {
      await downloadBackup(database);
      // Show success modal
      setSuccessModalData({
        title: 'Backup Created',
        message: 'Your backup has been created successfully and is ready to share.',
        details: [
          'The backup file has been saved to your device',
          'You can now share it to your preferred location',
          'All your projects, tasks, and time data are included'
        ]
      });
      setShowSuccessModal(true);
      // Refresh projects after successful backup
      await fetchAllProjects();
    } catch (error) {
      // Error handling is done in downloadBackup function
      console.error("Backup error:", error);
    } finally {
      setIsBackingUp(false);
    }
  };

  /**
   * Handles restoring data from a backup file
   */
  const handleRestoreData = () => {
    setShowRestoreModal(true);
  };

  /**
   * Handles restore confirmation
   */
  const handleRestoreConfirm = async () => {
    setShowRestoreModal(false);
    setIsRestoring(true);
    try {
      const backupInfo = await restoreFromSelectedFile(database);
      // Set backup info for confirmation modal
      setRestoreBackupInfo(backupInfo);
      setShowRestoreConfirmationModal(true);
      setIsRestoring(false);
    } catch (error) {
      // Error handling is done in restoreFromSelectedFile function
      console.error("Restore error:", error);
      setIsRestoring(false);
    }
  };

  /**
   * Handles final restore confirmation
   */
  const handleFinalRestoreConfirm = async () => {
    setShowRestoreConfirmationModal(false);
    setIsRestoring(true);
    try {
      // The actual restore was already done, just refresh the data
      await fetchAllProjects();
      // Show success modal
      setSuccessModalData({
        title: 'Restore Complete',
        message: 'Your data has been successfully restored from the backup.',
        details: [
          `${restoreBackupInfo.projectCount} projects restored`,
          `${restoreBackupInfo.taskCount} tasks restored`,
          `${restoreBackupInfo.timingCount} time records restored`
        ]
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Restore error:", error);
    } finally {
      setIsRestoring(false);
    }
  };

  return {
    projects,
    lastWorkedTask,
    filteredProjects,
    searchQuery,
    isLoading,
    isPopulating,
    isClearing,
    isBackingUp,
    isRestoring,
    fetchAllProjects,
    refreshProjects,
    handlePopulateDatabase,
    handlePopulateConfirm,
    handleClearDatabase,
    handleClearConfirm,
    handleBackupData,
    handleBackupConfirm,
    handleRestoreData,
    handleRestoreConfirm,
    handleFinalRestoreConfirm,
    handleSearch,
    clearSearch,
    // Modal states
    showBackupModal,
    setShowBackupModal,
    showRestoreModal,
    setShowRestoreModal,
    showRestoreConfirmationModal,
    setShowRestoreConfirmationModal,
    showSuccessModal,
    setShowSuccessModal,
    successModalData,
    setSuccessModalData,
    restoreBackupInfo,
    setRestoreBackupInfo,
    // Confirmation modal states
    showPopulateConfirmation,
    setShowPopulateConfirmation,
    showClearConfirmation,
    setShowClearConfirmation,
  };
};
