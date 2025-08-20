import {
  View,
  Text,
  Pressable,
  RefreshControl,
  ScrollView,
} from "react-native";
import { Entypo } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

import ProjectCard from "../../components/ProjectCard";
import LoadingView from "../../components/LoadingView";
import SearchBar from "../../components/SearchBar";
import { router } from "expo-router";
import { StyleSheet } from "react-native";
import { theme } from "../../globalStyle/theme";
import { useDatabaseManagement } from "./useDatabaseManagement";

/**
 * Home component that displays the main dashboard with projects and database management options
 * @returns The main home screen component
 */
const Home = () => {
  const {
    filteredProjects,
    searchQuery,
    isLoading,
    isPopulating,
    isClearing,
    refreshProjects,
    handlePopulateDatabase,
    handleClearDatabase,
    handleSearch,
    clearSearch,
  } = useDatabaseManagement();

  /**
   * Handles manual refresh of projects data
   */
  const handleRefresh = async () => {
    await refreshProjects();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerText}>aion</Text>
        <View style={styles.headerButtons}>
          <Pressable
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={isLoading}
          >
            <Entypo
              name="cycle"
              size={theme.components.icon.medium}
              color={theme.colors.neutral[800]}
            />
          </Pressable>
          <Pressable
            style={styles.addButton}
            onPress={() => router.push("AddProject")}
            disabled={isLoading}
          >
            <Entypo
              name="plus"
              size={theme.components.icon.medium}
              color={theme.colors.neutral[800]}
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.databaseButtonsContainer}>
        <Pressable
          style={[styles.databaseButton, styles.populateButton]}
          onPress={handlePopulateDatabase}
          disabled={isLoading || isPopulating || isClearing}
        >
          <View style={styles.buttonContent}>
            <View style={styles.buttonIconContainer}>
              {isPopulating ? (
                <Entypo
                  name="cycle"
                  size={theme.components.icon.small}
                  color={theme.colors.white}
                />
              ) : (
                <Entypo
                  name="database"
                  size={theme.components.icon.small}
                  color={theme.colors.white}
                />
              )}
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.databaseButtonText}>
                {isPopulating ? "Populating..." : "Populate Database"}
              </Text>
            </View>
          </View>
        </Pressable>

        <Pressable
          style={[styles.databaseButton, styles.clearButton]}
          onPress={handleClearDatabase}
          disabled={isLoading || isPopulating || isClearing}
        >
          <View style={styles.buttonContent}>
            <View style={styles.buttonIconContainer}>
              {isClearing ? (
                <Entypo
                  name="cycle"
                  size={theme.components.icon.small}
                  color={theme.colors.white}
                />
              ) : (
                <Entypo
                  name="trash"
                  size={theme.components.icon.small}
                  color={theme.colors.white}
                />
              )}
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.databaseButtonText}>
                {isClearing ? "Clearing..." : "Clear Database"}
              </Text>
            </View>
          </View>
        </Pressable>
      </View>

      <View style={styles.searchBarContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Buscar projetos..."
          onClear={clearSearch}
        />
      </View>

      {isLoading ? (
        <LoadingView />
      ) : (
        <ScrollView
          style={styles.projectsList}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              tintColor={theme.colors.white}
              colors={[theme.colors.white]}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {filteredProjects.length > 0 ? (
            <View>
              <Text style={styles.title}>Projetos</Text>
              {filteredProjects.map((project) => (
                <ProjectCard project={project} key={project.project_id} />
              ))}
            </View>
          ) : searchQuery ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🔍</Text>
              <Text style={styles.emptyStateTitle}>
                Nenhum projeto encontrado
              </Text>
              <Text style={styles.emptyStateSubtitle}>
                Tente ajustar sua busca ou criar um novo projeto
              </Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📁</Text>
              <Text style={styles.emptyStateTitle}>
                Nenhum projeto encontrado
              </Text>
              <Text style={styles.emptyStateSubtitle}>
                Comece criando seu primeiro projeto para organizar suas tarefas
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[900],
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: theme.spacing["4xl"],
  },
  header: {
    width: "100%",
    backgroundColor: theme.colors.neutral[900],
    height: 80,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing["2xl"],
    marginBottom: theme.spacing.lg,
  },
  headerText: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize["5xl"],
    letterSpacing: -0.5,
  },
  headerButtons: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  refreshButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    width: theme.spacing["4xl"],
    height: theme.spacing["4xl"],
    ...theme.shadows.md,
  },
  addButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    width: theme.spacing["4xl"],
    height: theme.spacing["4xl"],
    ...theme.shadows.md,
  },
  projectsList: {
    width: "100%",
    display: "flex",
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing["2xl"],
    marginTop: theme.spacing.lg,
  },
  title: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.xl,
    marginBottom: theme.spacing.md,
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing["4xl"],
    paddingHorizontal: theme.spacing["2xl"],
  },
  emptyStateIcon: {
    fontSize: theme.typography.fontSize["5xl"],
    marginBottom: theme.spacing.lg,
  },
  emptyStateTitle: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.xl,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  emptyStateSubtitle: {
    color: theme.colors.neutral[400],
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.md,
    textAlign: "center",
  },
  databaseButtonsContainer: {
    width: "100%",
    paddingHorizontal: theme.spacing["2xl"],
    marginTop: theme.spacing.sm,
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "space-between",
  },
  databaseButton: {
    flex: 1,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
    ...theme.shadows.md,
    borderWidth: 1,
    borderColor: "transparent",
  },
  populateButton: {
    backgroundColor: theme.colors.success[600],
    borderColor: theme.colors.success[500],
  },
  clearButton: {
    backgroundColor: theme.colors.error[600],
    borderColor: theme.colors.error[500],
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
  },
  buttonIconContainer: {
    width: theme.spacing["4xl"],
    height: theme.spacing["4xl"],
    borderRadius: theme.spacing["4xl"] / 2,
    backgroundColor: theme.colors.transparent.white[20],
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  buttonTextContainer: {
    flex: 1,
    alignItems: "flex-start",
  },
  databaseButtonText: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.sm,
    textAlign: "left",
    marginBottom: theme.spacing.xs,
    letterSpacing: 0.5,
  },
  searchBarContainer: {
    width: "100%",
    paddingHorizontal: theme.spacing["2xl"],
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    height: 50,
  },
});

export default Home;
