import { useCallback, useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { database } from "../../../hooks/useDatabase/database";
import { Task as ITask } from "../../../interfaces/Task";
import { Project as IProject } from "../../../interfaces/Project";
import Task from "../../components/Task";
import { Feather } from "@expo/vector-icons";

import styles from "./styles";
import { useFocusEffect } from "@react-navigation/native";
interface TaskWithTimed extends ITask {
  timed_until_now: number;
}

const HeaderInfoButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity onPress={onPress}>
    <Text>
      <Feather name="info" size={24} color="white" />
    </Text>
  </TouchableOpacity>
);

const AddTask = ({ navigation, project }) => (
  <TouchableOpacity
    style={styles.addTaskButton}
    onPress={() => {
      navigation.navigate("AddTaskModal", { project });
    }}
  >
    <Text>
      <Feather name="plus" size={40} color="black" />
    </Text>
  </TouchableOpacity>
);

const Project = ({ navigation, route }) => {
  const [tasks, setTasks] = useState<Array<ITask>>([]);
  const [timerIdRunning, setTimerIdRunning] = useState<number | null>(null);
  const isTimerRunning = timerIdRunning !== null;

  const project: IProject = route.params.project;

  useEffect(
    () =>
      navigation.addListener("beforeRemove", (e) => {
        if (!isTimerRunning) {
          // If we don't have unsaved changes, then we don't need to do anything
          return;
        }

        // Prevent default behavior of leaving the screen
        e.preventDefault();

        // Prompt the user before leaving the screen
        Alert.alert(
          "Parar timer?",
          "Seu timer ainda esta rodando. Se voce sair, perdera o tempo!",
          [
            { text: "Continuar aqui", style: "cancel", onPress: () => {} },
            {
              text: "Sair",
              style: "destructive",
              onPress: () => navigation.dispatch(e.data.action),
            },
          ]
        );
      }),
    [navigation, isTimerRunning]
  );

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
    if (isTimerRunning) return;
    navigation.navigate("Task", { task });
  };

  return (
    <View style={styles.container}>
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
      <Text style={{ color: "white" }}>
        isTimerRunning: {isTimerRunning} {"<-"}
      </Text>
      <AddTask navigation={navigation} project={project} />
    </View>
  );
};

export default Project;
