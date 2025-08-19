import { View, Text, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { AntDesign } from "@expo/vector-icons";
import TextInput from "../../components/TextInput";
import CurrencyInput from "../../components/CurrencyInput";
import Button from "../../components/Button";

import { useSQLiteContext } from "expo-sqlite";
import { router } from "expo-router";
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
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: theme.layout.padding.horizontal,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing['3xl'],
  },
  projectInfoSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.lg,
    marginBottom: theme.spacing.lg,
  },
  inputGroup: {
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
  helperText: {
    color: theme.colors.neutral[400],
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    marginTop: theme.spacing.xs,
    fontStyle: "italic",
  },
  buttonContainer: {
    marginTop: theme.spacing.xl,
  },
  // Legacy styles for backward compatibility
  label: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.md,
  },
  input: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.md,
  },
  projectInfoWrapper: {
    paddingHorizontal: theme.layout.padding.horizontal,
    gap: 30,
    paddingTop: 20,
  },
  errorMessage: {
    color: theme.colors.error[400],
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.md,
    textAlign: "center",
    marginTop: theme.spacing.lg,
  },
});

/**
 * AddProject component allows users to create new projects with name and hourly cost
 * @returns {JSX.Element} A form for adding projects with validation and modern UI
 */
const AddProject = () => {
  const database = useSQLiteContext();
  const [projectName, setProjectName] = useState<string>("");
  const [projectHourlyCost, setProjectHourlyCost] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleBackPress = () => {
    router.back();
  };

  const handleAddProject = async () => {
    if (projectName.trim() === "") {
      Alert.alert("Erro", "O nome do projeto não pode estar vazio.");
      return;
    }

    if (projectName.trim().length < 2) {
      Alert.alert("Erro", "O nome do projeto deve ter pelo menos 2 caracteres.");
      return;
    }

    setIsSubmitting(true);

    try {
      const existingProject = await database.getFirstAsync(
        "SELECT * FROM projects WHERE name = ?;",
        projectName.trim()
      );
      
      if (existingProject) {
        Alert.alert("Erro", "Um projeto com esse nome já existe.");
        setIsSubmitting(false);
        return;
      }

      const cost = projectHourlyCost === "" ? "00.00" : projectHourlyCost;

      await database.runAsync(
        "INSERT INTO projects (name, hourly_cost) VALUES (?, ?);",
        projectName.trim(),
        parseFloat(cost)
      );

      router.push("/");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível criar o projeto. Tente novamente.");
      setIsSubmitting(false);
    }
  };

  const handleChangeProjectName = (text: string) => {
    setProjectName(text);
  };

  const isFormValid = projectName.trim().length >= 2;

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.projectInfoSection}>
          <Text style={styles.sectionTitle}>Informações do Projeto</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nome do Projeto</Text>
            <TextInput
              onChangeText={(text: string) => handleChangeProjectName(text)}
              value={projectName}
              placeholder="Digite o nome do projeto..."
              autoFocus={true}
            />
            {projectName.length > 0 && (
              <Text style={[
                styles.characterCount,
                { color: isFormValid ? theme.colors.success[400] : theme.colors.error[400] }
              ]}>
                {projectName.length}/50 caracteres
              </Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Valor por Hora (R$)</Text>
            <CurrencyInput
              value={projectHourlyCost}
              onChange={(text: string) => setProjectHourlyCost(text)}
              placeholder="00,00"
            />
            <Text style={styles.helperText}>
              Deixe em branco para definir como R$ 0,00
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <Button 
            onPress={isFormValid && !isSubmitting ? handleAddProject : undefined}
            text={isSubmitting ? "Criando..." : "Criar Projeto"}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddProject;
