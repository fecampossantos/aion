import { Text, TouchableOpacity } from "react-native";
import { Project } from "../../../interfaces/Project";

import styles from "./styles";

interface ProjectCardProps {
  project: Project;
  navigation: any;
}

const ProjectCard = ({ project, navigation }: ProjectCardProps) => {
  const handlePress = async () => {
    navigation.navigate("Project", { project });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={() => handlePress()} testID="projectCard-touchable">
      <Text style={styles.projectName}>{project.name}</Text>
    </TouchableOpacity>
  );
};

export default ProjectCard;
