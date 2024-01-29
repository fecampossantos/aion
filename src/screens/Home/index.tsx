import { useState, useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Entypo } from "@expo/vector-icons";
import { useSQLiteContext } from "expo-sqlite/next";

import { Project } from "../../../interfaces/Project";
import ProjectCard from "../../components/ProjectCard";

import styles from "./styles";
import LoadingView from "../../components/LoadingView";
import { useFocusEffect } from "@react-navigation/native";

const Home = ({ navigation }) => {
  const database = useSQLiteContext();
  const [projects, setProjects] = useState<Array<Project>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  async function fetchAllProjects() {
    const p = await database.getAllAsync<Project>("SELECT * FROM projects;");
    setProjects(p);
  }

  useFocusEffect(
    useCallback(() => {
      fetchAllProjects();
      setIsLoading(false);
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Chrono</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddProject")}
          disabled={isLoading}
        >
          <Entypo name="plus" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <LoadingView />
      ) : (
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
      )}

      <StatusBar style="inverted" />
    </View>
  );
};

export default Home;
