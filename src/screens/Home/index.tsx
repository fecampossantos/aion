import { StatusBar } from "expo-status-bar";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Entypo } from "@expo/vector-icons";
import { useState } from "react";
import { Project } from "../../../interfaces/Project";
import ProjectCard from "../../components/ProjectCard";

import { database } from "../../../hooks/useDatabase/database";
import { useFocusEffect } from "@react-navigation/native";

import styles from "./styles";

const Home = ({ navigation }) => {
  const [projects, setProjects] = useState<Array<Project>>([]);

  useFocusEffect(() => {
    database.getAllProjects(setProjects);
  });

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
        <Text style={styles.title}>Projetos</Text>
        {projects.length > 0 ? (
          projects.map((project: Project) => (
            <ProjectCard
              project={project}
              key={project.project_id}
              navigation={navigation}
            />
          ))
        ) : (
          <Text style={styles.error}>Você ainda não tem projetos.</Text>
        )}
      </View>
      <StatusBar style="inverted" />
    </View>
  );
};

export default Home;
