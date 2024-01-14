import { Text, TouchableOpacity, View } from "react-native";
import styles from "./styles";
import Timer from "../Timer";
import { secondsToTimeHHMMSS } from "../../../utils/parser";
import { useSQLiteContext } from "expo-sqlite/next";

const Task = ({
  task,
  onPress,
  disableTimer = false,
  onInitTimer = () => {},
  onStopTimer = () => {},
  showTimedUntilNowOnTimer,
}: {
  task: any;
  onPress: () => void;
  disableTimer: boolean;
  onInitTimer: () => void;
  onStopTimer: () => void;
  showTimedUntilNowOnTimer: null | number;
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
    <TouchableOpacity
      onPress={() => onPress()}
      style={styles.container}
      testID="task-touchable"
    >
      <Text style={styles.name}>{task.name}</Text>
      <Timer
        onStop={(time) => onStop(time)}
        disabled={disableTimer}
        onInit={() => onInitTimer}
        textToShowWhenStopped={secondsToTimeHHMMSS(showTimedUntilNowOnTimer)}
      />
    </TouchableOpacity>
  );
};

export default Task;
