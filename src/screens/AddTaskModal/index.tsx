import { Text, TouchableOpacity, View } from "react-native";

import { Project as IProject } from "../../../interfaces/Project";
import { useEffect, useState } from "react";

import { database } from "../../../hooks/useDatabase/database";
import styles from "./styles";
import TextInput from "../../components/TextInput";
import Button from "../../components/Button";
const AddTaskModal = ({ route, navigation }) => {
  const project: IProject = route.params.project;

  const [taskName, setTaskName] = useState<string>("");

  useEffect(() => {
    navigation.setOptions({
      title: `Adicionar task em ${project.name}`,
    });
  }, []);

  const handleAddTaksToProject = () => {
    if (taskName === "") return;

    database.addNewTaskToProject(taskName, project.project_id);
    navigation.navigate("Project", { project });
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={taskName}
        onChangeText={(text: string) => setTaskName(text)}
        placeholder="Task"
      />
      <Button onPress={() => handleAddTaksToProject()} text="Adicionar task" />
    </View>
  );
};

export default AddTaskModal;
