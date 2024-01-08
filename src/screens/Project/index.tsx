import { useCallback, useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { database } from "../../../hooks/useDatabase/database";
import { Task as ITask } from "../../../interfaces/Task";
import { Project as IProject } from "../../../interfaces/Project";
import Task from "../../components/Task";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
interface TaskWithTimed extends ITask {
  timed_until_now: number;
}

const HeaderInfoButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity onPress={onPress}>
    <Text>
      <Feather name="info" size={24} color="black" />
    </Text>
  </TouchableOpacity>
);

const Project = ({ navigation, route }) => {
  const [tasks, setTasks] = useState<Array<ITask>>([]);
  const [timerIdRunning, setTimerIdRunning] = useState<number | null>(null);

  const project: IProject = route.params.project;

  useEffect(() => {
    navigation.setOptions({
      title: project.name,
      headerRight: () => (
        <HeaderInfoButton
          onPress={() =>
            navigation.navigate("ProjectInfo", {
              project,
            })
          }
        />
      ),
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      database.getAllTasksFromProjectWithTimed(project.project_id, setTasks);
    }, [timerIdRunning])
  );

  const handleNavigateToTask = (task: TaskWithTimed) => {
    navigation.navigate("Task", { task });
  };

  return (
    <View style={{ height: "100%" }}>
      <Text>{JSON.stringify(tasks)}</Text>
      {tasks.length > 0 ? (
        tasks.map((task: TaskWithTimed) => (
          <Task
            task={task}
            key={task.task_id}
            onPress={() => handleNavigateToTask(task)}
            disableTimer={
              timerIdRunning !== null && timerIdRunning !== task.task_id
            }
            onInitTimer={() => setTimerIdRunning(task.task_id)}
            onStopTimer={() => setTimerIdRunning(null)}
            showTimedUntilNowOnTimer={task.timed_until_now}
          />
        ))
      ) : (
        <Text>Esse projeto não tem tasks</Text>
      )}

      <View style={{ position: "absolute", bottom: 0, right: 0 }}>
        <TouchableOpacity
          style={{ width: 80, height: 80, backgroundColor: "black" }}
          onPress={() => {
            navigation.navigate("AddTaskModal", { project });
          }}
        >
          <Text>
            <Feather name="plus" size={24} color="white" />
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Project;
