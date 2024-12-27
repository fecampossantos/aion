import { Text, TouchableOpacity, View } from "react-native";
import styles from "./styles";
import Timer from "../Timer";
import { secondsToTimeHHMMSS } from "../../utils/parser";
import { useSQLiteContext } from "expo-sqlite";
import CheckBox from "../CheckBox";

interface TaskWithTimed {
  task_id: number;
  name: string;
  completed: 0 | 1;
  task_created_at: string;
  timed_until_now: number;
}

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
        <TouchableOpacity onPress={() => onPress()} testID="task-touchable">
          <Text style={[styles.name, task.completed && styles.strikeThrough]}>
            {task.name}
          </Text>
        </TouchableOpacity>
        <Timer
          onStop={(time) => onStop(time)}
          disabled={disableTimer || task.completed === 1}
          onInit={() => onInitTimer}
          textToShowWhenStopped={secondsToTimeHHMMSS(showTimedUntilNowOnTimer)}
        />
      </View>
    </View>
  );
};

export default Task;
