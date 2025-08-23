import { Text, View, ScrollView, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { Feather } from "@expo/vector-icons";
import TextInput from "../../components/TextInput";
import CurrencyInput from "../../components/CurrencyInput";
import Button from "../../components/Button";
import { useToast } from "../../components/Toast/ToastContext";

import { useSQLiteContext } from "expo-sqlite";
import { router, useLocalSearchParams } from "expo-router";
import { Project as IProject } from "../../interfaces/Project";
import globalStyle from "../../globalStyle";
import { theme } from "../../globalStyle/theme";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[900],
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 32,
    gap: 16,
  },
  title: {
    color: globalStyle.white,
    fontSize: 28,
    fontFamily: globalStyle.font.bold,
    textAlign: "center",
  },
  subtitle: {
    color: globalStyle.white,
    fontSize: 16,
    fontFamily: globalStyle.font.regular,
    textAlign: "center",
    opacity: 0.8,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: globalStyle.black.light,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: globalStyle.black.main,
  },
  formSection: {
    gap: 24,
  },
  inputGroup: {
    gap: 12,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  label: {
    color: globalStyle.white,
    fontFamily: globalStyle.font.medium,
    fontSize: 16,
  },
  input: {
    backgroundColor: globalStyle.black.main,
    borderWidth: 1,
    borderColor: globalStyle.black.light,
    borderRadius: 12,
    padding: 16,
    color: globalStyle.white,
    fontFamily: globalStyle.font.regular,
    fontSize: 16,
    minHeight: 56,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "#ef4444",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  errorMessage: {
    color: "#ef4444",
    fontFamily: globalStyle.font.medium,
    fontSize: 14,
    flex: 1,
  },
  actionSection: {
    alignItems: "center",
    paddingBottom: 40,
  },
  saveButton: {
    minWidth: 200,
    height: 56,
    borderRadius: 16,
  },
});

export const inputColor = globalStyle.white;

/**
 * EditProject component allows users to modify existing project details
 * @returns {JSX.Element} A form for editing project name and hourly cost with validation
 */
const EditProject = () => {
  const { projectID } = useLocalSearchParams();
  const [project, setProject] = useState<IProject>();

  const database = useSQLiteContext();
  const { showToast } = useToast();
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
        
        showToast("Projeto atualizado com sucesso!", "success");
        router.replace("/");
      } else {
        router.replace("/");
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
