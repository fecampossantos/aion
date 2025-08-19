import { Text, View, ScrollView, Alert } from "react-native";
import { useEffect, useState } from "react";
import { Feather } from "@expo/vector-icons";
import TextInput from "../../components/TextInput";
import CurrencyInput from "../../components/CurrencyInput";
import Button from "../../components/Button";

import styles from "./styles";
import { useSQLiteContext } from "expo-sqlite";
import { router, useLocalSearchParams } from "expo-router";
import { Project as IProject } from "../../interfaces/Project";
import globalStyle from "../../globalStyle";

/**
 * EditProject component allows users to modify existing project details
 * @returns {JSX.Element} A form for editing project name and hourly cost with validation
 */
const EditProject = () => {
  const { projectID } = useLocalSearchParams();
  const [project, setProject] = useState<IProject>();

  const database = useSQLiteContext();
  const [projectName, setProjectName] = useState<string>();
  const [projectHourlyCost, setProjectHourlyCost] = useState<string>();
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    async function getProject() {
      const project = await database.getFirstAsync<IProject>(
        `SELECT * FROM projects WHERE project_id = ?;`,
        projectID as string
      );

      if (project) {
        setProject(project);
        setProjectName(project.name);
        setProjectHourlyCost(`${project.hourly_cost.toString()},00`);
      }
    }

    getProject();
  }, [projectID]);

  /**
   * Handles the project edit submission with validation
   */
  const handleEditProject = async () => {
    if (projectName === "") {
      setErrorMessage("O nome do projeto não pode estar vazio");
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

    const cost = projectHourlyCost === "" ? "00.00" : projectHourlyCost.replace(",", ".");

    try {
      // Only update if there are actual changes
      if (projectName !== project.name || parseFloat(cost) !== project.hourly_cost) {
        await database.runAsync(
          "UPDATE projects SET name = ?, hourly_cost = ? WHERE project_id = ?;",
          projectName,
          parseFloat(cost),
          project.project_id
        );
        
        Alert.alert(
          "Sucesso", 
          "Projeto atualizado com sucesso!",
          [{ text: "OK", onPress: () => router.push("/") }]
        );
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Error updating project:", error);
      setErrorMessage("Erro ao atualizar o projeto. Tente novamente.");
    }
  };

  /**
   * Handles project name changes and clears error messages
   * @param {string} text - The new project name
   */
  const handleChangeProjectName = (text: string) => {
    setErrorMessage(null);
    setProjectName(text);
  };

  /**
   * Handles hourly cost changes and clears error messages
   * @param {string} text - The new hourly cost
   */
  const handleChangeHourlyCost = (text: string) => {
    setErrorMessage(null);
    setProjectHourlyCost(text);
  };

  if (!project) return null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Feather name="edit-3" color={globalStyle.white} size={32} />
        <Text style={styles.title}>Editar Projeto</Text>
        <Text style={styles.subtitle}>
          Atualize as informações do seu projeto
        </Text>
      </View>

      <View style={styles.formCard}>
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Feather name="folder" color={globalStyle.white} size={16} />
              <Text style={styles.label}>Nome do Projeto</Text>
            </View>
            <TextInput
              onChangeText={(text: string) => handleChangeProjectName(text)}
              value={projectName}
              placeholder="Digite o nome do projeto"
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Feather name="dollar-sign" color={globalStyle.white} size={16} />
              <Text style={styles.label}>Valor por Hora</Text>
            </View>
            <CurrencyInput
              value={projectHourlyCost}
              onChange={(text: string) => handleChangeHourlyCost(text)}
              placeholder="0,00"
              style={styles.input}
            />
          </View>
        </View>
      </View>

      {errorMessage && (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" color="#ef4444" size={16} />
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        </View>
      )}

      <View style={styles.actionSection}>
        <Button 
          onPress={() => handleEditProject()} 
          text="💾 Salvar Alterações"
          buttonStyle={styles.saveButton}
        />
      </View>
    </ScrollView>
  );
};

export default EditProject;
