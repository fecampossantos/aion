import { useCallback, useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Project as IProject } from "../../interfaces/Project";
import Task from "../../components/Task";
import { Feather } from "@expo/vector-icons";

import styles from "./styles";
import { useSQLiteContext } from "expo-sqlite";
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

const AddTask = ({ router, project }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <View style={styles.addButtonWrapper}>
      {isOpen ? (
        <View style={styles.addButtons}>
          <TouchableOpacity
            onPress={() => {
              setIsOpen(false);
              router.push({ pathname: "/AddTaskModal", params: { project } });
            }}
            style={[styles.addButton, { marginBottom: 20 }]}
          >
            <Text>Nova task</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setIsOpen(false);
              router.push({ pathname: "/AddRecordModal", params: { project } });
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

const Project = () => {
  const router = useRouter();
  const database = useSQLiteContext();
  const [tasks, setTasks] = useState<Array<TaskWithTimed>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [timerIdRunning, setTimerIdRunning] = useState<number | null>(null);
  const isTimerRunning = timerIdRunning !== null;

  const { projectID } = useLocalSearchParams();
  const [project, setProject] = useState<IProject>();

  useEffect(() => {
    async function getProject() {
      const project = await database.getFirstAsync<IProject>(
        `SELECT * FROM projects WHERE project_id = ?;`,
        projectID as string
      );

      setProject(project);
    }

    getProject();
  }, [projectID]);

  useEffect(() => {
    const handleBeforeRemove = () => {
      if (!isTimerRunning) return;

      Alert.alert(
        "Parar timer?",
        "Seu timer ainda esta rodando. Se voce sair, perdera o tempo!",
        [
          { text: "Continuar aqui", style: "cancel", onPress: () => {} },
          {
            text: "Sair",
            style: "destructive",
            onPress: () => router.replace("/Home"),
          },
        ]
      );
    };

    handleBeforeRemove();
  }, [isTimerRunning]);

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
      projectID as string
    );

    setTasks(allTasks);
  }

  useEffect(() => {
    getTasks();
    setIsLoading(false);
  }, [timerIdRunning]);

  const handleNavigateToTask = (task: TaskWithTimed) => {
    if (isTimerRunning) return;
    router.push({ pathname: "/Task", params: { taskID: task.task_id } });
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

      <AddTask router={router} project={project} />
    </View>
  );
};

export default Project;
