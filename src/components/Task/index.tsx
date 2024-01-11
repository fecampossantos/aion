import { Text, TouchableOpacity, View } from "react-native";
import { Task as ITask } from "../../../interfaces/Task";
import styles from "./styles";
import Timer from "../Timer";
import { database } from "../../../hooks/useDatabase/database";
import { secondsToTimeHHMMSS } from "../../../utils/parser";
interface TaskWithTimed extends ITask {
  timed_until_now: number;
}

const Task = ({
  task,
  onPress,
  disableTimer = false,
  onInitTimer = () => {},
  onStopTimer = () => {},
  showTimedUntilNowOnTimer,
}: {
  task: TaskWithTimed;
  onPress: () => void;
  disableTimer: boolean;
  onInitTimer: () => void;
  onStopTimer: () => void;
  showTimedUntilNowOnTimer: null | number;
}) => {
  const onStop = (time: number) => {
    onStopTimer();
    database.addTiming(task.task_id, time);
  };

  return (
    <TouchableOpacity onPress={() => onPress()} style={styles.container}>
      <Text style={styles.name}>{task.name}</Text>
      <Timer
        onStop={(time) => onStop(time)}
        disabled={disableTimer}
        onInit={() => onInitTimer()}
        textToShowWhenStopped={secondsToTimeHHMMSS(showTimedUntilNowOnTimer)}
      />
    </TouchableOpacity>
  );
};

export default Task;
