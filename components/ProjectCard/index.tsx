import { Pressable, Text } from "react-native";
import { AntDesign } from "@expo/vector-icons";

import { Project } from "../../interfaces/Project";
import styles from "./styles";
import { useRouter } from "expo-router";

interface ProjectCardProps {
  project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const router = useRouter();
  const handlePress = async () => {
    router.push({
      pathname: "Project",
      params: { projectID: project.project_id },
    });
  };

  return (
    <Pressable
      style={styles.container}
      onPress={() => handlePress()}
      testID="projectCard-touchable"
    >
      <Text style={styles.projectName}>{project.name}</Text>
      <AntDesign name="arrowright" size={24} color="white" />
    </Pressable>
  );
};

export default ProjectCard;
