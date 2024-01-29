import { Text, View } from "react-native";
import { useState } from "react";
import TextInput from "../../components/TextInput";
import CurrencyInput from "../../components/CurrencyInput";
import Button from "../../components/Button";

import styles from "./styles";
import { useSQLiteContext } from "expo-sqlite/next";
import { Project } from "../../../interfaces/Project";

const EditProject = ({ navigation, route }) => {
  const project: Project = route.params.project;

  const database = useSQLiteContext();
  const [projectName, setProjectName] = useState<string>(project.name);
  const [projectHourlyCost, setProjectHourlyCost] = useState<string>(
    `${project.hourly_cost.toString()},00`
  );
  const [errorMessage, setErrorMessage] = useState(null);

  const handleEditProject = async () => {
    if (projectName === "") {
      setErrorMessage("O nome do projeto nao pode estar vazio");
      return;
    }

    if (projectName !== project.name) {
      const existingProject = await database.getFirstAsync(
        "SELECT * FROM projects WHERE name = ?;",
        projectName
      );
      if (existingProject) {
        setErrorMessage("Um projeto com esse nome já existe");
        return;
      }
    }

    const cost = projectHourlyCost === "" ? "00.00" : projectHourlyCost;

    await database.runAsync(
      "UPDATE projects SET name = ?, hourly_cost = ? WHERE project_id = ?;",
      projectName,
      parseFloat(cost),
      project.project_id
    );

    navigation.navigate("Home");
  };

  const handleChangeProjectName = (text: string) => {
    setErrorMessage(null);
    setProjectName(text);
  };

  return (
    <View style={styles.container}>
      <View style={styles.projectInfoWrapper}>
        <View>
          <Text style={styles.label}>Projeto</Text>
          <TextInput
            onChangeText={(text: string) => handleChangeProjectName(text)}
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
      <Button onPress={() => handleEditProject()} text={"editar projeto"} />
      {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}
    </View>
  );
};

export default EditProject;
