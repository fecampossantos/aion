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
  const [errorMessage, setErrorMessage] = useState(null);

  const handleAddProject = async () => {
    console.log("adding project ", projectName, projectHourlyCost);
    if (projectName === "") {
      setErrorMessage("O nome do projeto nao pode estar vazio");
      return;
    }
    console.log("checking name");
    const existingProject = database.getProjectByName(projectName);
    if (existingProject) {
      console.log("Um projeto com esse nome ja existe");
      setErrorMessage("Um projeto com esse nome ja existe");
      return;
    }

    database.addNewProject(projectName, parseFloat(projectHourlyCost));
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
      <Button onPress={() => handleAddProject()} text={"adicionar projeto"} />
      {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}
    </View>
  );
};

export default AddProject;
