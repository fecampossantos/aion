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
import LastWorkedTask from "../../components/LastWorkedTask";
import SearchBar from "../../components/SearchBar";
import { router } from "expo-router";
import { StyleSheet } from "react-native";
import { theme } from "../../globalStyle/theme";
import { useDatabaseManagement } from "./useDatabaseManagement";
import { useTranslation } from "react-i18next";

/**
 * Home component that displays the main dashboard with projects
 * @returns The main home screen component
 */
const Home = () => {
  const { t } = useTranslation();
  const {
    projects,
    lastWorkedTask,
    filteredProjects,
    searchQuery,
    isLoading,
    refreshProjects,
    handleSearch,
    clearSearch,
  } = useDatabaseManagement();

  /**
   * Handles manual refresh of projects data
   */
  const handleRefresh = async () => {
    await refreshProjects();
  };

  /**
   * Handles navigation to the specific task
   */
  const handleNavigateToLastWorkedTask = () => {
    if (lastWorkedTask) {
      router.push(`/Task?taskID=${lastWorkedTask.task_id}`);
    }
  };

  /**
   * Handles navigation to settings page
   */
  const handleNavigateToSettings = () => {
    router.push("/Settings");
  };

  return (
    <View style={styles.container} testID="home-container">
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerText}>{t("app.name")}</Text>
        <View style={styles.headerButtons}>
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
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
        <View style={styles.searchBarContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder={t("home.searchProjects")}
            onClear={clearSearch}
          />
        </View>

        {isLoading ? (
          <LoadingView />
        ) : (
          <View style={styles.projectsList}>
            {filteredProjects.length > 0 ? (
              <View>
                <Text style={styles.title}>{t("navigation.projects")}</Text>
                {filteredProjects.map((project) => (
                  <ProjectCard project={project} key={project.project_id} />
                ))}
              </View>
            ) : searchQuery ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>🔍</Text>
                <Text style={styles.emptyStateTitle}>
                  {t("home.noProjectsFound")}
                </Text>
                <Text style={styles.emptyStateSubtitle}>
                  {t("home.noProjectsFoundSubtitle")}
                </Text>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>📁</Text>
                <Text style={styles.emptyStateTitle}>
                  {t("home.noProjects")}
                </Text>
                <Text style={styles.emptyStateSubtitle}>
                  {t("home.noProjectsSubtitle")}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Last Worked Task Section */}
        {lastWorkedTask && !isLoading && (
          <View style={styles.lastWorkedTaskContainer}>
            <Text style={styles.lastWorkedTaskTitle}>
              {t("home.lastWorkedTask")}
            </Text>
            <Text style={styles.lastWorkedTaskProjectName}>
              {lastWorkedTask.project_name}
            </Text>
            <LastWorkedTask
              task={lastWorkedTask}
              onPress={handleNavigateToLastWorkedTask}
            />
          </View>
        )}

        {/* Settings Section - End of Page */}
        <View style={styles.settingsContainer}>
          <Pressable
            style={styles.settingsButton}
            onPress={handleNavigateToSettings}
            disabled={isLoading}
          >
            <Entypo
              name="cog"
              size={theme.components.icon.medium}
              color={theme.colors.white}
            />
          </Pressable>
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
    width: "100%",
  },
  scrollViewContent: {
    paddingBottom: theme.spacing["4xl"],
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
  lastWorkedTaskContainer: {
    width: "100%",
    paddingHorizontal: theme.spacing["2xl"],
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  lastWorkedTaskTitle: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.lg,
    marginBottom: theme.spacing.md,
    letterSpacing: 0.5,
  },
  lastWorkedTaskProjectName: {
    color: theme.colors.neutral[400],
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.sm,
    marginBottom: theme.spacing.sm,
    letterSpacing: 0.3,
  },
  searchBarContainer: {
    width: "100%",
    paddingHorizontal: theme.spacing["2xl"],
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    height: 50,
  },
  settingsContainer: {
    width: "100%",
    paddingHorizontal: theme.spacing["2xl"],
    marginTop: theme.spacing["2xl"],
    alignItems: "flex-end",
    position: "relative",
  },
  settingsButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.spacing["4xl"] / 2,
    width: theme.spacing["4xl"],
    height: theme.spacing["4xl"],
  },
});

export default Home;
