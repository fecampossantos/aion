import { Text, View, Pressable, StyleSheet } from "react-native";
import Timer from "../Timer";
import { secondsToTimeHHMMSS } from "../../utils/parser";
import { useSQLiteContext } from "expo-sqlite";
import CheckBox from "../CheckBox";
import { theme } from "../../globalStyle/theme";

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
    justifyContent: "flex-start",
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary[500],
    ...theme.shadows.sm,
  },
  name: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.medium,
    marginLeft: theme.spacing.sm,
  },
  touchableContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
    minHeight: 40,
    paddingRight: theme.spacing.sm,
  },
  checkBoxWrapper: {
    borderRightColor: theme.colors.neutral[600],
    borderRightWidth: 1,
    paddingRight: 0,
  },
  strikeThrough: {
    textDecorationLine: "line-through",
    textDecorationStyle: "solid",
    color: theme.colors.neutral[400],
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
 * Task component displays a single task with checkbox, timer, and completion functionality
 * @param {TaskWithTimed} task - The task data to display
 * @param {() => void} onPress - Function called when task is pressed
 * @param {boolean} disableTimer - Whether the timer should be disabled
 * @param {() => void} onInitTimer - Function called when timer starts
 * @param {() => void} onStopTimer - Function called when timer stops
 * @param {number | null} showTimedUntilNowOnTimer - Time to show when timer is stopped
 * @param {(isChecked: boolean, task: TaskWithTimed) => void} handleDoneTask - Function to handle task completion
 * @returns {JSX.Element} A styled task item with checkbox, name, and timer
 */
const Task = ({
  task,
  onPress,
  disableTimer = false,
  onInitTimer,
  onStopTimer,
  showTimedUntilNowOnTimer,
  handleDoneTask,
  showTimer = true,
}: {
  task: TaskWithTimed;
  onPress: () => void;
  disableTimer?: boolean;
  onInitTimer?: () => void;
  onStopTimer?: () => void;
  showTimedUntilNowOnTimer?: null | number;
  handleDoneTask: (isChecked: boolean, task: TaskWithTimed) => void;
  showTimer: boolean;
}) => {
  const database = useSQLiteContext();

  const onStop = async (time: number) => {
    onStopTimer();
    await database.runAsync(
      "INSERT INTO timings (task_id, time) VALUES (?, ?);",
      task.task_id,
      time
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.checkBoxWrapper}>
        <CheckBox
          onPress={(isChecked) => handleDoneTask(isChecked, task)}
          isChecked={task.completed === 1}
        />
      </View>

      <View style={styles.touchableContainer}>
        <Pressable
          onPress={() => onPress()}
          testID="task-touchable"
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.7 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
        >
          <Text style={[styles.name, task.completed && styles.strikeThrough]}>
            {task.name}
          </Text>
        </Pressable>
      </View>
      {showTimer && (
        <Timer
          onStop={(time) => onStop(time)}
          disabled={disableTimer || task.completed === 1}
          onInit={() => onInitTimer()}
          textToShowWhenStopped={secondsToTimeHHMMSS(showTimedUntilNowOnTimer)}
          key={task.task_id.toString() + "-timer"}
        />
      )}
    </View>
  );
};

export default Task;
