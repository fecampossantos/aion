import { useState, useEffect } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { Entypo } from "@expo/vector-icons";
import { useSQLiteContext } from "expo-sqlite";

import { Project } from "../../interfaces/Project";
import ProjectCard from "../../components/ProjectCard";

import LoadingView from "../../components/LoadingView";
import { router } from "expo-router";
import { StyleSheet } from "react-native";
import globalStyle from "../../globalStyle";
import { populateDatabase, clearDatabase, getDatabaseStats } from "../../utils/databaseUtils";

const Home = () => {
  const database = useSQLiteContext();
  const [projects, setProjects] = useState<Array<Project>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPopulating, setIsPopulating] = useState<boolean>(false);
  const [isClearing, setIsClearing] = useState<boolean>(false);

  async function fetchAllProjects() {
    const p = await database.getAllAsync<Project>("SELECT * FROM projects;");
    setProjects(p);
  }

  useEffect(() => {
    fetchAllProjects();
    setIsLoading(false);
  }, []);

  const handlePopulateDatabase = async () => {
    Alert.alert(
      "Populate Database",
      "This will add 2 projects with extensive tasks and 2 months of time tracking data. This may take a few seconds.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Populate",
          onPress: async () => {
            setIsPopulating(true);
            try {
              await populateDatabase(database);
              await fetchAllProjects();
              const stats = await getDatabaseStats(database);
              Alert.alert(
                "Success!",
                `Database populated successfully!\n\nAdded:\n• ${stats.projects} projects\n• ${stats.tasks} tasks\n• ${stats.timings} time entries`
              );
            } catch (error) {
              Alert.alert("Error", "Failed to populate database. Please try again.");
              console.error("Population error:", error);
            } finally {
              setIsPopulating(false);
            }
          },
        },
      ]
    );
  };

  const handleClearDatabase = async () => {
    Alert.alert(
      "Clear Database",
      "This will permanently delete ALL projects, tasks, and time tracking data. This action cannot be undone!",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            setIsClearing(true);
            try {
              await clearDatabase(database);
              await fetchAllProjects();
              Alert.alert("Success!", "Database cleared successfully!");
            } catch (error) {
              Alert.alert("Error", "Failed to clear database. Please try again.");
              console.error("Clear error:", error);
            } finally {
              setIsClearing(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Chrono</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => router.push("AddProject")}
          disabled={isLoading}
        >
          <Entypo name="plus" size={24} color="black" />
        </Pressable>
      </View>

      <View style={styles.databaseButtonsContainer}>
        <Pressable
          style={[styles.databaseButton, styles.populateButton]}
          onPress={handlePopulateDatabase}
          disabled={isLoading || isPopulating || isClearing}
        >
          <Text style={styles.databaseButtonText}>
            {isPopulating ? "Populating..." : "Populate Database"}
          </Text>
          <Text style={styles.databaseButtonSubtext}>
            Add 2 months of sample data
          </Text>
        </Pressable>
        
        <Pressable
          style={[styles.databaseButton, styles.clearButton]}
          onPress={handleClearDatabase}
          disabled={isLoading || isPopulating || isClearing}
        >
          <Text style={styles.databaseButtonText}>
            {isClearing ? "Clearing..." : "Clear Database"}
          </Text>
          <Text style={styles.databaseButtonSubtext}>
            Remove all data
          </Text>
        </Pressable>
      </View>

      {isLoading ? (
        <LoadingView />
      ) : (
        <View style={styles.projectsList}>
          {projects.length > 0 ? (
            <View>
              <Text style={styles.title}>Projetos</Text>
              {projects.map((project: Project) => (
                <ProjectCard project={project} key={project.project_id} />
              ))}
            </View>
          ) : (
            <Text style={styles.error}>Você ainda não tem projetos.</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: globalStyle.background,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 40,
  },
  header: {
    width: "100%",
    backgroundColor: globalStyle.background,
    height: 80,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    color: "white",
  },
  headerText: {
    color: globalStyle.white,
    fontFamily: globalStyle.font.bold,
    fontSize: 40,
  },
  addButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: globalStyle.white,
    borderRadius: 4,
    width: 30,
    height: 30,
  },
  projectsList: {
    width: "100%",
    display: "flex",
    gap: 20,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  title: {
    color: globalStyle.white,
    fontFamily: globalStyle.font.bold,
    fontSize: 20,
    marginBottom: 14,
  },
  error: {
    color: globalStyle.white,
    fontFamily: globalStyle.font.italicRegular,
    fontSize: 20,
  },
  databaseButtonsContainer: {
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 10,
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
  databaseButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 60,
  },
  populateButton: {
    backgroundColor: "#4CAF50",
  },
  clearButton: {
    backgroundColor: "#f44336",
  },
  databaseButtonText: {
    color: globalStyle.white,
    fontFamily: globalStyle.font.bold,
    fontSize: 14,
    textAlign: "center",
  },
  databaseButtonSubtext: {
    color: globalStyle.white,
    fontFamily: globalStyle.font.regular,
    fontSize: 12,
    textAlign: "center",
    marginTop: 2,
    opacity: 0.8,
  },
});

export default Home;
