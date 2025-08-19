import { Pressable, Text, View } from "react-native";
import { AntDesign } from "@expo/vector-icons";

import { Project } from "../../interfaces/Project";
import styles from "./styles";
import { useRouter } from "expo-router";

interface ProjectCardProps {
  project: Project;
}

/**
 * ProjectCard component that displays project information in a card format
 * @param project - The project object containing project details
 * @returns A pressable card component for navigation to project details
 */
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
      <Text style={styles.projectName} numberOfLines={1}>
        {project.name}
      </Text>
      <View style={styles.iconContainer}>
        <AntDesign 
          name="arrowright" 
          size={20} 
          color="white" 
          style={styles.arrowIcon}
        />
      </View>
    </Pressable>
  );
};

export default ProjectCard;
