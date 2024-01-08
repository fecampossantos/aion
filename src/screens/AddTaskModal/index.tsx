import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { Project as IProject } from "../../../interfaces/Project";
import { useEffect, useState } from "react";

import { database } from "../../../hooks/useDatabase/database";

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
    <View>
      <TextInput
        value={taskName}
        onChangeText={(text) => setTaskName(text)}
        placeholder="Task"
      />
      <TouchableOpacity onPress={() => handleAddTaksToProject()}>
        <Text>Adicionar task</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddTaskModal;
