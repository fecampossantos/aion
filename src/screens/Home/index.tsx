import { StatusBar } from "expo-status-bar";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Project } from "../../../interfaces/Project";
import ProjectCard from "../../components/ProjectCard";

import { database } from "../../../hooks/useDatabase/database";

const Home = ({ navigation }) => {
  const [projects, setProjects] = useState<Array<Project>>([]);

  useEffect(() => {
    database.getAllProjects(setProjects);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Chronos</Text>
        <TouchableOpacity>
          <Text>
            <AntDesign name={"plus"} size={24} color="white" />
          </Text>
        </TouchableOpacity>
      </View>

      {projects.length > 0 ? (
        projects.map((project: Project) => (
          <ProjectCard
            project={project}
            key={project.project_id}
            navigation={navigation}
          />
        ))
      ) : (
        <Text>Você ainda não tem projetos.</Text>
      )}

      <StatusBar style="auto" />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 40,
  },
  header: {
    width: "100%",
    backgroundColor: "black",
    height: 80,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    color: "white",
  },
  headerText: {
    color: "white",
  },
});
