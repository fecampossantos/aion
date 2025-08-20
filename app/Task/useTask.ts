import { useState, useEffect } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { Timing as ITiming } from "../../interfaces/Timing";

/**
 * Custom hook for managing task functionality
 * @param {string} taskID - The task ID
 * @returns {Object} Task state and functions
 */
export const useTask = (taskID: string) => {
  const database = useSQLiteContext();
  
  // Check if database context is available
  if (!database) {
    throw new Error('Database context not available');
  }
  
  const [timings, setTimings] = useState<Array<ITiming>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [taskTitle, setTaskTitle] = useState<string>("");

  /**
   * Fetches timings and task details for the current task
   */
  const getTimingsFromTask = async () => {
    if (!taskID) return;

    try {
      // Get task details
      const taskResult = await database.getAllAsync<{ name: string }>(
        "SELECT name FROM tasks WHERE task_id = ?;",
        taskID
      );

      if (taskResult && taskResult.length > 0) {
        setTaskTitle(taskResult[0].name);
      }

      const timings = await database.getAllAsync<ITiming>(
        "SELECT * FROM timings WHERE task_id = ? ORDER BY created_at DESC;",
        taskID
      );
      setTimings(timings || []);
    } catch (error) {
      // Handle errors gracefully
      setTimings([]);
      setTaskTitle("");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getTimingsFromTask();
  }, [taskID, isTimerRunning]);

  // Cleanup effect to reset timer state on unmount
  useEffect(() => {
    return () => {
      setIsTimerRunning(false);
    };
  }, []);

  /**
   * Deletes a specific timing record
   * @param {number} timingID - The timing ID to delete
   */
  const handleDeleteTiming = async (timingID: number) => {
    try {
      await database.runAsync(
        "DELETE FROM timings WHERE timing_id = ?;",
        timingID
      );
      setIsLoading(true);
      await getTimingsFromTask(); // Refresh timings after deletion
    } catch (error) {
      // Handle errors gracefully - just log them and don't throw
      console.error('Failed to delete timing:', error);
    }
  };

  /**
   * Initializes the timer for the task
   */
  const onInitTimer = () => {
    setIsTimerRunning(true);
  };

  /**
   * Stops the timer and saves the timing record
   * @param {number} time - The time in seconds to save
   */
  const onStopTimer = async (time: number) => {
    setIsTimerRunning(false);
    await database.runAsync(
      "INSERT INTO timings (task_id, time) VALUES (?, ?);",
      taskID,
      time
    );
  };

  /**
   * Calculates the total time from all timings
   * @returns {number} Total time in seconds
   */
  const calculateTotalTime = () => {
    return timings.reduce((total, timing) => total + timing.time, 0);
  };

  /**
   * Formats total time in a human-readable format
   * @param {number} seconds - Total time in seconds
   * @returns {string} Formatted time string
   */
  const formatTotalTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return {
    timings,
    isLoading,
    isTimerRunning,
    taskTitle,
    getTimingsFromTask,
    handleDeleteTiming,
    onInitTimer,
    onStopTimer,
    calculateTotalTime,
    formatTotalTime,
  };
};
