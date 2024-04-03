import { useCallback, useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { Project as IProject } from "../../../interfaces/Project";
import Task from "../../components/Task";
import { Feather } from "@expo/vector-icons";

import styles from "./styles";
import { useFocusEffect } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite/next";
import LoadingView from "../../components/LoadingView";
interface TaskWithTimed {
  task_id: number;
  name: string;
  completed: 0 | 1;
  task_created_at: string;
  timed_until_now: number;
}

const HeaderInfoButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity onPress={onPress}>
    <Text>
      <Feather name="info" size={24} color="white" />
    </Text>
  </TouchableOpacity>
);

const AddTask = ({ navigation, project }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <View style={styles.addButtonWrapper}>
      {isOpen ? (
        <View style={styles.addButtons}>
          <TouchableOpacity
            onPress={() => {
              setIsOpen(false);
              navigation.navigate("AddTaskModal", { project });
            }}
            style={[styles.addButton, { marginBottom: 20 }]}
          >
            <Text>Nova task</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setIsOpen(false);
              navigation.navigate("AddRecordModal", { project });
            }}
            style={styles.addButton}
          >
            <Text>Novo tempo</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.addIconWrapper}>
        <TouchableOpacity
          style={styles.addButtonIcon}
          onPress={() => {
            setIsOpen(!isOpen);
          }}
        >
          <Text>
            <Feather name="plus" size={40} color="black" />
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Project = ({ navigation, route }) => {
  const database = useSQLiteContext();
  const [tasks, setTasks] = useState<Array<TaskWithTimed>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
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
      title: `${project.name} - Tasks`,
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

  async function getTasks() {
    const allTasks = await database.getAllAsync<TaskWithTimed>(
      `SELECT 
  t.task_id,
  t.name,
  t.completed,
  t.created_at AS task_created_at,
  COALESCE(SUM(ti.time), 0) AS timed_until_now
FROM 
  tasks t
LEFT JOIN 
  timings ti ON t.task_id = ti.task_id
WHERE 
  t.project_id = ?
GROUP BY 
  t.task_id, t.name, t.completed, t.created_at
ORDER BY 
  t.created_at;`,
      project.project_id
    );

    setTasks(allTasks);
  }

  useFocusEffect(
    useCallback(() => {
      getTasks();
      setIsLoading(false);
    }, [timerIdRunning])
  );

  const handleNavigateToTask = (task: TaskWithTimed) => {
    if (isTimerRunning) return;
    navigation.navigate("Task", { task });
  };

  const handleDoneTask = async (value: boolean, task: TaskWithTimed) => {
    const toInsert = value ? 1 : 0;

    await database.runAsync(
      "UPDATE tasks SET completed = ? WHERE task_id = ?;",
      toInsert,
      task.task_id
    );
    getTasks();
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <LoadingView />
      ) : tasks.length > 0 ? (
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
            handleDoneTask={handleDoneTask}
          />
        ))
      ) : (
        <Text style={styles.noTasksWarning}>Esse projeto não tem tasks</Text>
      )}

      <AddTask navigation={navigation} project={project} />
    </View>
  );
};

export default Project;
