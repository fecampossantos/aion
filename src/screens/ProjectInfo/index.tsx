import { Project as IProject } from "../../../interfaces/Project";
import { Text, TouchableOpacity, View } from "react-native";

import { database } from "../../../hooks/useDatabase/database";

const ProjectInfo = ({ route, navigation }) => {
  const project: IProject = route.params.project;

  const handleDeleteProject = () => {
    database.deleteProjectById(project.project_id);
    navigation.navigate("Home");
  };

  return (
    <View>
      <TouchableOpacity onPress={() => handleDeleteProject()}>
        <Text>Apagar projeto</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProjectInfo;
