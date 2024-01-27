import { StatusBar } from "expo-status-bar";
import { View, Text, TouchableOpacity } from "react-native";
import { Entypo } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Project } from "../../../interfaces/Project";
import ProjectCard from "../../components/ProjectCard";

import { useFocusEffect } from "@react-navigation/native";

import styles from "./styles";
import { useSQLiteContext } from "expo-sqlite/next";

const Home = ({ navigation }) => {
  const database = useSQLiteContext();
  const [projects, setProjects] = useState<Array<Project>>([]);

  async function fetchAllProjects() {
    const p = await database.getAllAsync<Project>("SELECT * FROM projects;");
    setProjects(p);
  }

  useEffect(() => {
    fetchAllProjects();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Chronos</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddProject")}
        >
          <Entypo name="plus" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.projectsList}>
        {projects.length > 0 ? (
          <>
            <Text style={styles.title}>Projetos</Text>
            {projects.map((project: Project) => (
              <ProjectCard
                project={project}
                key={project.project_id}
                navigation={navigation}
              />
            ))}
          </>
        ) : (
          <Text style={styles.error}>Você ainda não tem projetos.</Text>
        )}
      </View>

      <StatusBar style="inverted" />
    </View>
  );
};

export default Home;
