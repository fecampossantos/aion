import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { database } from "../../../hooks/useDatabase/database";
import { Task as ITask } from "../../../interfaces/Task";
import { Project as IProject } from "../../../interfaces/Project";
import Task from "../../components/Task";

interface TaskWithTimed extends ITask {
  timed: number;
}

const Project = ({ navigation, route }) => {
  // const { openDatabase } = useDatabase();

  const [tasks, setTasks] = useState<Array<ITask>>([]);

  const project: IProject = route.params.project;

  useEffect(() => {
    navigation.setOptions({ title: project.name });
    // the tasks should have a new propery called "timed" that will be the sum of all the timings for that task
    database.getAllTasksFromProject(project.project_id, setTasks);
  }, []);

  return (
    <View>
      {tasks.length > 0 ?
        tasks.map((task: TaskWithTimed) => (
          <Task task={task} key={task.task_id} />
        )) : <Text>Esse projeto não tem tasks</Text>}
    </View>
  );
};

export default Project;
