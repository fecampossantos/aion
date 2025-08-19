import { Text, TouchableOpacity, View, Pressable } from "react-native";
import styles from "./styles";
import Timer from "../Timer";
import { secondsToTimeHHMMSS } from "../../utils/parser";
import { useSQLiteContext } from "expo-sqlite";
import CheckBox from "../CheckBox";
import { theme } from "../../globalStyle/theme";

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
  onInitTimer = () => {},
  onStopTimer = () => {},
  showTimedUntilNowOnTimer,
  handleDoneTask,
}: {
  task: TaskWithTimed;
  onPress: () => void;
  disableTimer: boolean;
  onInitTimer: () => void;
  onStopTimer: () => void;
  showTimedUntilNowOnTimer: null | number;
  handleDoneTask: (isChecked: boolean, task: TaskWithTimed) => void;
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
      <Timer
        onStop={(time) => onStop(time)}
        disabled={disableTimer || task.completed === 1}
        onInit={() => onInitTimer()}
        textToShowWhenStopped={secondsToTimeHHMMSS(showTimedUntilNowOnTimer)}
      />
    </View>
  );
};

export default Task;
