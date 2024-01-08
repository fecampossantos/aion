import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { database } from "../../../hooks/useDatabase/database";
import { useState } from "react";

import { parseToCurrencyFormat } from "../../../utils/parser";

const AddProject = ({ navigation }) => {
  const [projectName, setProjectName] = useState<string>("");
  const [projectHourlyCost, setProjectHourlyCost] = useState<string>("00,00");

  const handleAddProject = async () => {
    if (projectName === "") return;

    const existingProject = await database.getProjectByName(projectName);
    if (existingProject) return;

    database.addNewProject(projectName, parseFloat(projectHourlyCost));

    navigation.navigate("Home");
  };

  return (
    <View>
      <TextInput
        onChangeText={(text) => setProjectName(text)}
        value={projectName}
        placeholder="Nome do projeto"
      />
      <TextInput
        keyboardType="numeric"
        value={projectHourlyCost}
        placeholder="Custo/hora do projeto"
        onChangeText={(text) =>
          setProjectHourlyCost(parseToCurrencyFormat(text))
        }
      />

      <TouchableOpacity onPress={() => handleAddProject()}>
        <Text>Adicionar projeto</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddProject;
