import { Text, TouchableOpacity, View } from "react-native";
import { database } from "../../../hooks/useDatabase/database";
import { useState } from "react";
import TextInput from "../../components/TextInput";
import CurrencyInput from "../../components/CurrencyInput";
import Button from "../../components/Button";

import styles, { inputColor } from "./styles";

const AddProject = ({ navigation }) => {
  const [projectName, setProjectName] = useState<string>("");
  const [projectHourlyCost, setProjectHourlyCost] = useState<string>("");

  const handleAddProject = async () => {
    if (projectName === "") return;

    const existingProject = await database.getProjectByName(projectName);
    if (existingProject) return;

    database.addNewProject(projectName, parseFloat(projectHourlyCost));

    navigation.navigate("Home");
  };

  return (
    <View style={styles.container}>
      <View style={styles.projectInfoWrapper}>
        <View>
          <Text style={styles.label}>Projeto</Text>
          <TextInput
            onChangeText={(text) => setProjectName(text)}
            value={projectName}
            placeholder="Nome do projeto"
          />
        </View>
        <View>
          <Text style={styles.label}>Valor cobrado por hora</Text>
          <CurrencyInput
            value={projectHourlyCost}
            onChange={(text: string) => setProjectHourlyCost(text)}
            placeholder="00,00"
          />
        </View>
      </View>
      <Button onPress={() => handleAddProject()} text={"adicionar projeto"} />
    </View>
  );
};

export default AddProject;
