import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { theme } from "../../globalStyle/theme";
import { fullDateWithHour } from "../../utils/parser";
import { useTranslation } from "react-i18next";

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.neutral[800],
    borderRadius: theme.borderRadius.lg,
    marginVertical: theme.spacing.xs,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary[500],
    ...theme.shadows.sm,
  },
  taskInfo: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  taskName: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.medium,
    marginBottom: theme.spacing.xs,
  },
  lastWorkedText: {
    color: theme.colors.neutral[400],
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
  },
  timeInfo: {
    alignItems: "flex-end",
    marginLeft: theme.spacing.sm,
  },
  totalTime: {
    color: theme.colors.primary[400],
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    marginBottom: theme.spacing.xs,
  },
  lastWorkedDate: {
    color: theme.colors.neutral[400],
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.regular,
  },
});

interface LastWorkedTaskData {
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
 * LastWorkedTask component displays a simplified view of the last worked task
 * showing only the task name and last time worked information
 * @param {LastWorkedTaskData} task - The last worked task data
 * @param {() => void} onPress - Function called when the task is pressed to navigate to task page
 * @returns {JSX.Element} A styled last worked task item with name and time information
 */
const LastWorkedTask = ({
  task,
  onPress,
}: {
  task: LastWorkedTaskData;
  onPress: () => void;
}) => {
  const { t } = useTranslation();
  
  const formatLastWorkedDate = (dateString: string) => {
    if (!dateString) return t("home.neverWorked");

    const { d, time } = fullDateWithHour(dateString);
    return t("home.lastWorked", { date: `${d} at ${time}` });
  };

  const formatTotalTime = (seconds: number) => {
    if (!seconds || seconds === 0) return "0:00:00";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, "0")}`;
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      testID="last-worked-task-touchable"
    >
      <View style={styles.taskInfo}>
        <Text style={styles.taskName} numberOfLines={2}>
          {task.name}
        </Text>
        <Text style={styles.lastWorkedText}>
          {formatLastWorkedDate(task.last_timing_date)}
        </Text>
      </View>

      <View style={styles.timeInfo}>
        <Text style={styles.totalTime}>
          {formatTotalTime(task.timed_until_now)}
        </Text>
        <Text style={styles.lastWorkedDate}>{t("home.totalTime")}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default LastWorkedTask;
