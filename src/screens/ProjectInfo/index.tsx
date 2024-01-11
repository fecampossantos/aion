import { Project as IProject } from "../../../interfaces/Project";
import { Text, TouchableOpacity, View } from "react-native";

import { database } from "../../../hooks/useDatabase/database";
import styles from "./styles";
import Button from "../../components/Button";

const ProjectInfo = ({ route, navigation }) => {
  const project: IProject = route.params.project;

  const handleDeleteProject = () => {
    database.deleteProjectById(project.project_id);
    navigation.navigate("Home");
  };

  return (
    <View style={styles.container}>
      <Button onPress={() => handleDeleteProject()} text="Apagar projeto" />
    </View>
  );
};

export default ProjectInfo;
