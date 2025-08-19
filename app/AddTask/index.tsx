import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { Project as IProject } from "../../interfaces/Project";
import { useEffect, useState } from "react";

import TextInput from "../../components/TextInput";
import Button from "../../components/Button";
import { useSQLiteContext } from "expo-sqlite";
import { router, useLocalSearchParams } from "expo-router";
import { theme } from "../../globalStyle/theme";

const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: theme.colors.neutral[900],
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: theme.layout.padding.horizontal,
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: theme.colors.neutral[800],
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.neutral[800],
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
    ...theme.shadows.sm,
  },
  headerTitle: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize['2xl'],
    lineHeight: theme.typography.lineHeight.tight,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.layout.padding.horizontal,
    paddingTop: theme.spacing.xl,
  },
  projectInfo: {
    backgroundColor: theme.colors.neutral[800],
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.md,
  },
  projectLabel: {
    color: theme.colors.neutral[400],
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.sm,
    marginBottom: theme.spacing.xs,
  },
  projectName: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.lg,
  },
  formSection: {
    flex: 1,
  },
  sectionTitle: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.lg,
    marginBottom: theme.spacing.lg,
  },
  inputContainer: {
    marginBottom: theme.spacing.xl,
  },
  inputLabel: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.md,
    marginBottom: theme.spacing.sm,
  },
  characterCount: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    marginTop: theme.spacing.xs,
    textAlign: "right",
  },
  buttonContainer: {
    marginTop: theme.spacing.xl,
  },
});

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
