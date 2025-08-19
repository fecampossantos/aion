import { useEffect, useState } from "react";
import { Alert, Text, Pressable, View, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { Project as IProject } from "../../interfaces/Project";
import Task from "../../components/Task";
import { StatusBar } from "expo-status-bar";
import { theme } from "../../globalStyle/theme";

import { useSQLiteContext } from "expo-sqlite";
import LoadingView from "../../components/LoadingView";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[900],
    paddingTop: theme.spacing.md,
  },
  
  // Stats Section
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing['2xl'],
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.neutral[800],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: "center",
    marginHorizontal: theme.spacing.xs,
    ...theme.shadows.sm,
  },
  statNumber: {
    color: theme.colors.primary[500],
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize['3xl'],
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    color: theme.colors.neutral[400],
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  
  // Tasks Section
  tasksSection: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.lg,
    marginBottom: theme.spacing.lg,
    letterSpacing: 0.5,
  },
  tasksList: {
    flex: 1,
  },
  tasksListContent: {
    paddingBottom: theme.spacing['4xl'],
  },
  
  // Empty State
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing['4xl'],
    paddingHorizontal: theme.spacing['2xl'],
  },
  emptyStateIcon: {
    fontSize: theme.typography.fontSize['5xl'],
    marginBottom: theme.spacing.lg,
  },
  emptyStateTitle: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.lg,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  emptyStateSubtitle: {
    color: theme.colors.neutral[400],
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.md,
    textAlign: "center",
    lineHeight: theme.typography.lineHeight.normal,
  },
});

interface TaskWithTimed {
  task_id: number;
  name: string;
  completed: 0 | 1;
  task_created_at: string;
  timed_until_now: number;
}

/**
 * Project component displays a project with its tasks and manages task operations
 * @returns {JSX.Element} A view showing project tasks with timer and completion functionality
 */
const Project = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const database = useSQLiteContext();
  const [tasks, setTasks] = useState<Array<TaskWithTimed>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [timerIdRunning, setTimerIdRunning] = useState<number | null>(null);
  const isTimerRunning = timerIdRunning !== null;

  const { projectID } = useLocalSearchParams();
  const [project, setProject] = useState<IProject>();

  useEffect(() => {
    async function getProject() {
      const project = await database.getFirstAsync<IProject>(
        `SELECT * FROM projects WHERE project_id = ?;`,
        projectID as string
      );

      setProject(project);
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
            onPress: () => router.replace("/Home"),
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, isTimerRunning]);

  async function getTasks() {
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
      projectID as string
    );

    setTasks(allTasks);
  }

  useEffect(() => {
    getTasks();
    setIsLoading(false);
  }, [timerIdRunning]);

  const handleNavigateToTask = (task: TaskWithTimed) => {
    if (isTimerRunning) return;
    router.push({
      pathname: "/Task",
      params: { taskID: task.task_id, taskName: task.name, projectID },
    });
  };

  const handleDoneTask = async (value: boolean, task: TaskWithTimed) => {
    const toInsert = value ? 1 : 0;

    await database.runAsync(
      "UPDATE tasks SET completed = ? WHERE task_id = ?;",
      toInsert,
      task.task_id
    );
    getTasks();
  };

  if (!project) return <LoadingView />;

  const completedTasks = tasks.filter((task) => task.completed === 1).length;
  const totalTasks = tasks.length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <ScrollView
      style={styles.tasksList}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.tasksListContent}
    >
      <View style={styles.container}>
        <StatusBar style="light" />

        {/* Project Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalTasks}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{completedTasks}</Text>
            <Text style={styles.statLabel}>Concluídas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalTasks - completedTasks}</Text>
            <Text style={styles.statLabel}>Pendentes</Text>
          </View>
        </View>

        {/* Tasks Section */}
        <View style={styles.tasksSection}>
          <Text style={styles.sectionTitle}>Tarefas</Text>

          {isLoading ? (
            <LoadingView />
          ) : tasks.length > 0 ? (
            <View>
              {tasks.map((task: TaskWithTimed) => (
                <Task
                  task={task}
                  key={task.task_id}
                  onPress={() => handleNavigateToTask(task)}
                  disableTimer={
                    timerIdRunning !== null && timerIdRunning !== task.task_id
                  }
                  onInitTimer={() => setTimerIdRunning(task.task_id)}
                  onStopTimer={() => setTimerIdRunning(null)}
                  showTimedUntilNowOnTimer={task.timed_until_now}
                  handleDoneTask={handleDoneTask}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📋</Text>
              <Text style={styles.emptyStateTitle}>
                Nenhuma tarefa encontrada
              </Text>
              <Text style={styles.emptyStateSubtitle}>
                Comece criando sua primeira tarefa para este projeto
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default Project;
