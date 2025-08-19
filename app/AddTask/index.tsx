import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Project as IProject } from "../../interfaces/Project";
import { useEffect, useState } from "react";

import styles from "./styles";
import TextInput from "../../components/TextInput";
import Button from "../../components/Button";
import { useSQLiteContext } from "expo-sqlite";
import { router, useLocalSearchParams } from "expo-router";
import { theme } from "../../globalStyle/theme";

/**
 * AddTask component allows users to create new tasks for a project
 * @returns {JSX.Element} A form for adding tasks with name input and submit button
 */
const AddTask = () => {
  const database = useSQLiteContext();
  const { projectID } = useLocalSearchParams();
  const [project, setProject] = useState<IProject>();
  const [taskName, setTaskName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    async function getProject() {
      const project = await database.getFirstAsync<IProject>(
        `SELECT * FROM projects WHERE project_id = ?;`,
        projectID as string
      );
      setProject(project);
    }

    getProject();
  }, [projectID]);

  const handleBackPress = () => {
    router.back();
  };

  const handleAddTaskToProject = async () => {
    if (taskName.trim() === "") {
      Alert.alert("Erro", "Por favor, insira um nome para a task.");
      return;
    }

    if (taskName.trim().length < 2) {
      Alert.alert("Erro", "O nome da task deve ter pelo menos 2 caracteres.");
      return;
    }

    setIsSubmitting(true);

    try {
      await database.runAsync(
        "INSERT INTO tasks (project_id, name, completed) VALUES (?, ?, 0);",
        project.project_id,
        taskName.trim()
      );

      router.push({
        pathname: "Project",
        params: { projectID: project.project_id },
      });
    } catch (error) {
      Alert.alert("Erro", "Não foi possível criar a task. Tente novamente.");
      setIsSubmitting(false);
    }
  };

  const isFormValid = taskName.trim().length >= 2;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <View style={styles.projectInfo}>
          <Text style={styles.projectLabel}>Projeto:</Text>
          <Text style={styles.projectName}>
            {project?.name || "Carregando..."}
          </Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Detalhes da Task</Text>

          <View style={styles.inputContainer}>
            <TextInput
              value={taskName}
              onChangeText={(text: string) => setTaskName(text)}
              placeholder="Digite o nome da task..."
              autoFocus={true}
            />
            {taskName.length > 0 && (
              <Text
                style={[
                  styles.characterCount,
                  {
                    color: isFormValid
                      ? theme.colors.success[400]
                      : theme.colors.error[400],
                  },
                ]}
              >
                {taskName.length}/50 caracteres
              </Text>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <Button
              onPress={handleAddTaskToProject}
              text={isSubmitting ? "Criando..." : "Criar Task"}
            />
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default AddTask;
