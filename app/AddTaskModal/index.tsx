import { View } from "react-native";

import { Project as IProject } from "../../interfaces/Project";
import { useEffect, useState } from "react";

import styles from "./styles";
import TextInput from "../../components/TextInput";
import Button from "../../components/Button";
import { useSQLiteContext } from "expo-sqlite";
import { router, useLocalSearchParams } from "expo-router";

const AddTaskModal = () => {
  const database = useSQLiteContext();
  const { project } = useLocalSearchParams();

  const [taskName, setTaskName] = useState<string>("");

  // useEffect(() => {
  //   navigation.setOptions({
  //     title: `Adicionar task em ${project.name}`,
  //   });
  // }, []);

  const handleAddTaksToProject = async () => {
    if (taskName === "") return;

    await database.runAsync(
      "INSERT INTO tasks (project_id, name, completed) VALUES (?, ?, 0);",
      project.project_id,
      taskName
    );
    router.push({ pathname: "Project", params: { project } });
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

export default AddTaskModal;
