import { useState, useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { Entypo } from "@expo/vector-icons";
import { useSQLiteContext } from "expo-sqlite";

import { Project } from "../../interfaces/Project";
import ProjectCard from "../../components/ProjectCard";

import LoadingView from "../../components/LoadingView";
import { router } from "expo-router";
import { StyleSheet } from "react-native";
import globalStyle from "../../globalStyle";

const Home = () => {
  const database = useSQLiteContext();
  const [projects, setProjects] = useState<Array<Project>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  async function fetchAllProjects() {
    const p = await database.getAllAsync<Project>("SELECT * FROM projects;");
    setProjects(p);
  }

  useEffect(() => {
    fetchAllProjects();
    setIsLoading(false);
  }, []);

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
});

export default Home;
