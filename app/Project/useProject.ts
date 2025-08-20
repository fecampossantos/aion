import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Project as IProject } from "../../interfaces/Project";

interface TaskWithTimed {
  task_id: number;
  name: string;
  completed: 0 | 1;
  task_created_at: string;
  timed_until_now: number;
}

/**
 * Custom hook for managing project functionality
 * @param {string} projectID - The project ID
 * @returns {Object} Project state and functions
 */
export const useProject = (projectID: string) => {
  const database = useSQLiteContext();
  const navigation = useNavigation();
  const router = useRouter();
  
  // Check if database context is available
  if (!database) {
    throw new Error('Database context not available');
  }
  
  const [tasks, setTasks] = useState<Array<TaskWithTimed>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [timerIdRunning, setTimerIdRunning] = useState<number | null>(null);
  const [project, setProject] = useState<IProject>();

  const isTimerRunning = timerIdRunning !== null;

  useEffect(() => {
    async function getProject() {
      try {
        const project = await database.getFirstAsync<IProject>(
          `SELECT * FROM projects WHERE project_id = ?;`,
          projectID
        );

        setProject(project);
      } catch (error) {
        // Set project to null on error and ensure loading is false
        setProject(null);
      } finally {
        setIsLoading(false);
      }
    }

    getProject();
  }, [projectID]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      if (!isTimerRunning) return;

      Alert.alert(
        "Parar timer?",
        "Seu timer ainda esta rodando. Se voce sair, perdera o tempo!",
        [
          { text: "Continuar aqui", style: "cancel", onPress: () => {} },
          {
            text: "Sair",
            style: "destructive",
            onPress: () => router.replace("/"),
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, isTimerRunning, router]);

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
    } catch (error) {
      // Set tasks to undefined on error
      setTasks(undefined);
    }
  };

  useEffect(() => {
    getTasks();
    setIsLoading(false);
  }, [timerIdRunning]);

  // Cleanup effect to reset timer state on unmount
  useEffect(() => {
    return () => {
      setTimerIdRunning(null);
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
   * Initializes the timer for a specific task
   * @param {number} taskId - The task ID to start the timer for
   */
  const handleInitTimer = (taskId: number) => {
    setTimerIdRunning(taskId);
  };

  /**
   * Stops the currently running timer
   */
  const handleStopTimer = () => {
    setTimerIdRunning(null);
  };

  return {
    tasks,
    isLoading,
    timerIdRunning,
    project,
    isTimerRunning,
    getTasks,
    handleNavigateToTask,
    handleDoneTask,
    handleInitTimer,
    handleStopTimer,
  };
};
