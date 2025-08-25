import {
  View,
  Text,
  Pressable,
  RefreshControl,
  ScrollView,
  Animated,
} from "react-native";
import { Entypo } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { BlurView } from "expo-blur";

import ProjectCard from "../../components/ProjectCard";
import LoadingView from "../../components/LoadingView";
import LastWorkedTask from "../../components/LastWorkedTask";
import SearchBar from "../../components/SearchBar";
import { router } from "expo-router";
import { StyleSheet } from "react-native";
import { theme } from "../../globalStyle/theme";
import { useDatabaseManagement } from "./useDatabaseManagement";
import { useRef, useState, useEffect } from "react";

/**
 * Home component that displays the main dashboard with projects
 * @returns The main home screen component
 */
const Home = () => {
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

  // Animated values for scroll-based animations
  const scrollY = useRef(new Animated.Value(0)).current;
  const [blurIntensityValue, setBlurIntensityValue] = useState(0);
  
  // Animation interpolations with smooth easing
  const headerTextScale = scrollY.interpolate({
    inputRange: [0, 80, 120],
    outputRange: [1, 0.65, 0.6],
    extrapolate: 'clamp',
  });
  
  const headerTextTranslateX = scrollY.interpolate({
    inputRange: [0, 80, 120],
    outputRange: [0, -40, -50],
    extrapolate: 'clamp',
  });
  
  const headerTextTranslateY = scrollY.interpolate({
    inputRange: [0, 80, 120],
    outputRange: [0, -8, -10],
    extrapolate: 'clamp',
  });
  
  const addButtonOpacity = scrollY.interpolate({
    inputRange: [0, 30, 60],
    outputRange: [1, 0.3, 0],
    extrapolate: 'clamp',
  });
  
  const addButtonScale = scrollY.interpolate({
    inputRange: [0, 30, 60],
    outputRange: [1, 0.8, 0.6],
    extrapolate: 'clamp',
  });
  
  const addButtonTranslateY = scrollY.interpolate({
    inputRange: [0, 30, 60],
    outputRange: [0, -10, -20],
    extrapolate: 'clamp',
  });
  
  // Set up listener for blur intensity
  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      const intensity = Math.min(Math.max((value / 120) * 25, 0), 25);
      setBlurIntensityValue(intensity);
    });
    
    return () => {
      scrollY.removeListener(listener);
    };
  }, [scrollY]);

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
      <View style={styles.headerContainer}>
        <Animated.View style={styles.blurContainer}>
          <BlurView
            intensity={blurIntensityValue}
            tint="dark"
            style={styles.blurView}
          />
        </Animated.View>
        <View style={styles.header}>
          <Animated.Text 
            style={[
              styles.headerText,
              {
                transform: [
                  { scale: headerTextScale },
                  { translateX: headerTextTranslateX },
                  { translateY: headerTextTranslateY },
                ],
              },
            ]}
          >
            aion
          </Animated.Text>
          <Animated.View 
            style={[
              styles.headerButtons,
              {
                opacity: addButtonOpacity,
                transform: [
                  { translateY: addButtonTranslateY },
                  { scale: addButtonScale },
                ],
              },
            ]}
          >
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
          </Animated.View>
        </View>
      </View>

      <Animated.ScrollView
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
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
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
          <View style={styles.projectsList}>
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
                  Tente ajustar sua busca ou criar um novo projeto.
                </Text>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>📁</Text>
                <Text style={styles.emptyStateTitle}>
                  Nenhum projeto ainda
                </Text>
                <Text style={styles.emptyStateSubtitle}>
                  Crie seu primeiro projeto para começar a organizar suas tarefas.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Last Worked Task Section */}
        {lastWorkedTask && !isLoading && (
          <View style={styles.lastWorkedTaskContainer}>
            <Text style={styles.lastWorkedTaskTitle}>
              Última Tarefa Trabalhada
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
      </Animated.ScrollView>
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
  headerContainer: {
    position: "absolute",
    top: theme.spacing["4xl"],
    left: 0,
    right: 0,
    width: "100%",
    height: 80,
    zIndex: 10,
    overflow: "hidden",
  },
  blurContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  blurView: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
  },
  header: {
    position: "relative",
    zIndex: 2,
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing["2xl"],
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
    marginTop: 80 + theme.spacing.lg,
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
