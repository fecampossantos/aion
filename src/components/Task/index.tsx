import { Text, View } from "react-native";
import { Task as ITask } from "../../../interfaces/Task";
import styles from "../ProjectCard/styles";
import Timer from "../Timer";

interface TaskWithTimed extends ITask {
  timed: number;
}

const Task = ({ task }: { task: TaskWithTimed }) => {
    const onStop = (time) => {
        console.log('stopou em time ', time)
    }
  return (
    <View style={styles.container}>
      {/* add checkbox here for completed */}
      <Text>{task.name}</Text>
      <Text>{task.timed}</Text>
      <Timer onStop={(time) => onStop(time)}/>
    </View>
  );
};

export default Task;
