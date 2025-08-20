import { Text, Pressable, View, ScrollView, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { theme } from "../../globalStyle/theme";
import Task from "../../components/Task";
import LoadingView from "../../components/LoadingView";
import { useLocalSearchParams } from "expo-router";
import { useProject } from "./useProject";

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

/**
 * Project component displays a project with its tasks and manages task operations
 * @returns {JSX.Element} A view showing project tasks with timer and completion functionality
 */
const Project = () => {
  const { projectID } = useLocalSearchParams();
  
  const {
    tasks,
    isLoading,
    project,
    handleNavigateToTask,
    handleDoneTask,
    handleInitTimer,
    handleStopTimer,
  } = useProject(projectID as string);

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
              {tasks.map((task) => (
                <Task
                  task={task}
                  key={task.task_id}
                  onPress={() => handleNavigateToTask(task)}
                  disableTimer={false}
                  onInitTimer={() => handleInitTimer(task.task_id)}
                  onStopTimer={handleStopTimer}
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
