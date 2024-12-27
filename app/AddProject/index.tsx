import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { useEffect, useState } from "react";
import TextInput from "../../components/TextInput";
import CurrencyInput from "../../components/CurrencyInput";
import Button from "../../components/Button";

import styles from "./styles";
import { useSQLiteContext } from "expo-sqlite";
import { router, Stack, useNavigation } from "expo-router";

const AddProject = () => {
  const database = useSQLiteContext();
  const [projectName, setProjectName] = useState<string>("");
  const [projectHourlyCost, setProjectHourlyCost] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerLeft: () => (
        <Pressable>
          <Text>test</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  const handleAddProject = async () => {
    if (projectName === "") {
      setErrorMessage("O nome do projeto nao pode estar vazio");
      return;
    }
    const existingProject = await database.getFirstAsync(
      "SELECT * FROM projects WHERE name = ?;",
      projectName
    );
    if (existingProject) {
      setErrorMessage("Um projeto com esse nome já existe");
      return;
    }

    const cost = projectHourlyCost === "" ? "00.00" : projectHourlyCost;

    await database.runAsync(
      "INSERT INTO projects (name, hourly_cost) VALUES (?, ?);",
      projectName,
      parseFloat(cost)
    );

    router.push("/");
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
