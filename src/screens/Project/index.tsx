import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import useDatabase from "../../../hooks/useDatabase";
import { Task as ITask } from "../../../interfaces/Task";
import { Project as IProject } from "../../../interfaces/Project";
import Task from "../../components/Task";

interface TaskWithTimed extends ITask {
  timed: number;
}

const Project = ({ navigation, route }) => {
  const { openDatabase } = useDatabase();

  const [tasks, setTasks] = useState<Array<ITask>>([]);

  const project: IProject = route.params.project;

  useEffect(() => {
    navigation.setOptions({ title: project.name });
    const db = openDatabase();

    // the tasks should have a new propery called "timed" that will be the sum of all the timings for that task

    const sqlQuery = `
    SELECT
      tasks.*,
      COALESCE(SUM(timings.stoppedAt - timings.startedAt), 0) AS timed
    FROM
      tasks
    LEFT JOIN
      timings ON tasks.task_id = timings.task_id
    WHERE
      tasks.project_id = ?
    GROUP BY
      tasks.task_id;
  `;

    db.transaction((tx) => {
      tx.executeSql(
        sqlQuery,
        [project.project_id],
        (_, { rows }) => {
          setTasks(rows._array);
          console.log(tasks);
        },
        (tx, error) => {
          console.log(error);
          return true;
        }
      );
    });

    setTasks(tasks);
  }, []);

  return (
    <View>
      {tasks &&
        tasks.map((task: TaskWithTimed) => (
          <Task task={task} key={task.task_id} />
        ))}
    </View>
  );
};

export default Project;
