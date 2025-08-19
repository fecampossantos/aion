import { ScrollView, Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { Timing as ITiming } from "../../interfaces/Timing";
import { useRouter, useLocalSearchParams } from "expo-router";
import { AntDesign, Feather, Ionicons } from "@expo/vector-icons";

import Timer from "../../components/Timer";
import Timing from "../../components/Timing";
import { useSQLiteContext } from "expo-sqlite";
import LoadingView from "../../components/LoadingView";
import { theme } from "../../globalStyle/theme";

const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: theme.colors.neutral[900],
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: theme.layout.padding.horizontal,
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: theme.colors.neutral[800],
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.neutral[800],
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
    ...theme.shadows.sm,
  },
  taskTitle: {
    flex: 1,
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize["2xl"],
    lineHeight: theme.typography.lineHeight.tight,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: theme.spacing["3xl"],
  },
  timerSection: {
    marginTop: theme.spacing.lg,
    alignSelf: "center",
  },
  sectionTitle: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.lg,
    marginBottom: theme.spacing.md,
  },
  statsSection: {
    flexDirection: "row",
    paddingHorizontal: theme.layout.padding.horizontal,
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.neutral[800],
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.md,
  },
  statValue: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.xl,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    color: theme.colors.neutral[400],
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
  },
  timingsSection: {
    paddingHorizontal: theme.layout.padding.horizontal,
    paddingTop: theme.spacing.lg,
  },
  timingsSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  noTimingsWarningContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: theme.spacing["3xl"],
    paddingBottom: theme.spacing.xl,
  },
  noTimingsWarningText: {
    color: theme.colors.neutral[400],
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.lg,
    marginTop: theme.spacing.md,
    textAlign: "center",
  },
  noTimingsSubtext: {
    color: theme.colors.neutral[500],
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    marginTop: theme.spacing.sm,
    textAlign: "center",
  },
});

/**
 * Task component displays a single task with timer, statistics, and timing sessions
 * @returns {JSX.Element} A view showing task details with timer and timing history
 */
const Task = () => {
  const router = useRouter();
  const { taskID, taskName } = useLocalSearchParams();
  const database = useSQLiteContext();
  const [timings, setTimings] = useState<Array<ITiming>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [taskTitle, setTaskTitle] = useState<string>("");

  const getTimingsFromTask = async () => {
    if (!taskID) return;

    // Get task details
    const taskResult = await database.getAllAsync<{ name: string }>(
      "SELECT name FROM tasks WHERE task_id = ?;",
      taskID as string
    );

    if (taskResult.length > 0) {
      setTaskTitle(taskResult[0].name);
    }

    const timings = await database.getAllAsync<ITiming>(
      "SELECT * FROM timings WHERE task_id = ? ORDER BY created_at DESC;",
      taskID as string
    );
    setTimings(timings);
    setIsLoading(false);
  };

  useEffect(() => {
    getTimingsFromTask();
  }, [taskID, isTimerRunning]);

  const handleDeleteTiming = async (timingID: number) => {
    await database.runAsync(
      "DELETE FROM timings WHERE timing_id = ?;",
      timingID
    );
    setIsLoading(true);
    await getTimingsFromTask(); // Refresh timings after deletion
  };

  const onInitTimer = () => {
    setIsTimerRunning(true);
  };

  const onStopTimer = async (time: number) => {
    setIsTimerRunning(false);
    await database.runAsync(
      "INSERT INTO timings (task_id, time) VALUES (?, ?);",
      taskID as string,
      time
    );
  };

  const calculateTotalTime = () => {
    return timings.reduce((total, timing) => total + timing.time, 0);
  };

  const formatTotalTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleAddRecordPress = () => {
    // Get the project ID from the task
    router.push({
      pathname: "AddRecord",
      params: {
        projectID: taskID, // This will be used to get the project context
        taskID: taskID,
        taskName: taskTitle,
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.timerSection}>
          <Text style={styles.sectionTitle}>Timer</Text>
          <Timer
            onInit={onInitTimer}
            onStop={onStopTimer}
            taskName={taskTitle}
          />
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Feather name="clock" size={24} color={theme.colors.primary[400]} />
            <Text style={styles.statValue}>
              {formatTotalTime(calculateTotalTime())}
            </Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
          <View style={styles.statCard}>
            <Feather name="list" size={24} color={theme.colors.success[400]} />
            <Text style={styles.statValue}>{timings.length}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
        </View>

        <View style={styles.timingsSection}>
          <View style={styles.timingsSectionHeader}>
            <Text style={styles.sectionTitle}>Time Sessions</Text>
            <TouchableOpacity onPress={handleAddRecordPress}>
              <Ionicons
                name="add-circle-outline"
                size={24}
                color={theme.colors.white}
              />
            </TouchableOpacity>
          </View>
          {isLoading ? (
            <LoadingView />
          ) : (
            <View>
              {timings.length > 0 ? (
                timings.map((t: ITiming, index: number) => (
                  <Timing
                    timing={t}
                    key={t.timing_id}
                    deleteTiming={() => {
                      setIsLoading(true);
                      handleDeleteTiming(t.timing_id);
                    }}
                    isTimerRunning={isTimerRunning}
                  />
                ))
              ) : (
                <View style={styles.noTimingsWarningContainer}>
                  <Feather
                    name="clock"
                    size={48}
                    color={theme.colors.neutral[400]}
                  />
                  <Text style={styles.noTimingsWarningText}>
                    No time sessions yet
                  </Text>
                  <Text style={styles.noTimingsSubtext}>
                    Start the timer to record your first session
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default Task;
