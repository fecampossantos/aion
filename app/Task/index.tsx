import { ScrollView, Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { AntDesign, Feather, Ionicons } from "@expo/vector-icons";

import Timer from "../../components/Timer";
import Timing from "../../components/Timing";
import LoadingView from "../../components/LoadingView";
import Pagination from "../../components/Pagination";
import { theme } from "../../globalStyle/theme";
import { useTask } from "./useTask";

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
  resultsInfo: {
    color: theme.colors.neutral[400],
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    textAlign: "center",
    marginBottom: theme.spacing.md,
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
  
  const {
    timings,
    isLoading,
    isTimerRunning,
    taskTitle,
    currentPage,
    onInitTimer,
    onStopTimer,
    calculateTotalTime,
    formatTotalTime,
    handleDeleteTiming,
    getPaginatedTimings,
    getTotalPages,
    goToNextPage,
    goToPreviousPage,
    goToPage,
  } = useTask(taskID as string);
  
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

  const paginatedTimings = getPaginatedTimings();
  const totalPages = getTotalPages();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.timerSection}>
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
                <>
                  <Text style={styles.resultsInfo}>
                    Showing {paginatedTimings.length} of {timings.length} sessions
                  </Text>
                  
                  {paginatedTimings.map((t) => (
                    <Timing
                      timing={t}
                      key={t.timing_id}
                      deleteTiming={() => handleDeleteTiming(t.timing_id)}
                      isTimerRunning={isTimerRunning}
                    />
                  ))}

                  {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={goToPage}
                      onNextPage={goToNextPage}
                      onPreviousPage={goToPreviousPage}
                    />
                  )}
                </>
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
