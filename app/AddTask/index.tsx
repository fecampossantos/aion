import { View } from "react-native";

import { Project as IProject } from "../../interfaces/Project";
import { useEffect, useState } from "react";

import styles from "./styles";
import TextInput from "../../components/TextInput";
import Button from "../../components/Button";
import { useSQLiteContext } from "expo-sqlite";
import { router, useLocalSearchParams } from "expo-router";

/**
 * AddTask component allows users to create new tasks for a project
 * @returns {JSX.Element} A form for adding tasks with name input and submit button
 */
const AddTask = () => {
  const database = useSQLiteContext();
  const { projectID } = useLocalSearchParams();
  const [project, setProject] = useState<IProject>();

  const [taskName, setTaskName] = useState<string>("");

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

  const handleAddTaksToProject = async () => {
    if (taskName === "") return;

    await database.runAsync(
      "INSERT INTO tasks (project_id, name, completed) VALUES (?, ?, 0);",
      project.project_id,
      taskName
    );
    router.push({
      pathname: "Project",
      params: { projectID: project.project_id },
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={taskName}
        onChangeText={(text: string) => setTaskName(text)}
        placeholder="Task"
      />
      <Button
        onPress={async () => await handleAddTaksToProject()}
        text="Adicionar task"
      />
    </View>
  );
};

export default AddTask;
