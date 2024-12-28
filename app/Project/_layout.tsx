import { router, Slot, useLocalSearchParams } from "expo-router";
import Content from "../../components/Content";
import { AntDesign } from "@expo/vector-icons";
import { Pressable, Text } from "react-native";
import { useEffect, useState } from "react";
import { Project as IProject } from "../../interfaces/Project";
import { useSQLiteContext } from "expo-sqlite";

const ProjectLayout = () => {
  const { projectID } = useLocalSearchParams();
  const [project, setProject] = useState<IProject>();
  const database = useSQLiteContext();

  useEffect(() => {
    async function getProject() {
      const project = await database.getFirstAsync<IProject>(
        `SELECT * FROM projects WHERE project_id = ?;`,
        projectID as string
      );
      setProject(project);
    }

    getProject();
  }, [projectID]);

  const HeaderInfoButton = () => (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "ProjectInfo",
          params: { projectID: project.project_id },
        })
      }
    >
      <Text>
        <AntDesign name="infocirlceo" size={24} color="white" />
      </Text>
    </Pressable>
  );

  if (!project) return null;

  return (
    <Content.Wrapper>
      <Content.Header right={<HeaderInfoButton />} title={project.name} />
      <Content.Body>
        <Slot />
      </Content.Body>
    </Content.Wrapper>
  );
};

export default ProjectLayout;
