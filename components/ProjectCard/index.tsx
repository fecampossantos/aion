import { Pressable, Text, View, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";

import { Project } from "../../interfaces/Project";
import { useRouter } from "expo-router";
import { theme } from "../../globalStyle/theme";

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: theme.components.card.height,
    borderColor: "transparent",
    borderWidth: 0,
    borderRadius: theme.components.card.borderRadius,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.components.card.paddingHorizontal,
    paddingVertical: theme.components.card.paddingVertical,
    backgroundColor: theme.components.card.backgroundColor,
    ...theme.components.card,
    marginVertical: theme.spacing.xs,
  },
  projectName: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.lg,
    flex: 1,
    marginRight: theme.spacing.md,
  },
  iconContainer: {
    width: theme.spacing['4xl'],
    height: theme.spacing['4xl'],
    borderRadius: theme.spacing['4xl'] / 2,
    backgroundColor: theme.colors.transparent.white[10],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.transparent.white[20],
  },
  arrowIcon: {
    opacity: 0.8,
  },
});

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
