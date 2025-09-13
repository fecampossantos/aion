import { router, Slot, useLocalSearchParams } from "expo-router";
import Content from "../../components/Content";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useEffect, useState } from "react";
import { Project as IProject } from "../../interfaces/Project";
import { useSQLiteContext } from "expo-sqlite";
import { theme } from "../../globalStyle/theme";

interface TaskStats {
  completed: number;
}

const ProjectLayout = () => {
  const { projectID } = useLocalSearchParams();
  const [project, setProject] = useState<IProject>();
  const [totalTasks, setTotalTasks] = useState<number>(0);
  const [completedTasks, setCompletedTasks] = useState<number>(0);
  const database = useSQLiteContext();

  useEffect(() => {
    async function getProject() {
      const project = await database.getFirstAsync<IProject>(
        `SELECT * FROM projects WHERE project_id = ?;`,
        projectID as string
      );
      setProject(project);
    }

    async function getTaskStats() {
      const tasks = await database.getAllAsync<TaskStats>(
        `SELECT completed FROM tasks WHERE project_id = ?;`,
        projectID as string
      );

      const total = tasks.length;
      const completed = tasks.filter((task) => task.completed === 1).length;

      setTotalTasks(total);
      setCompletedTasks(completed);
    }

    getProject();
    getTaskStats();
  }, [projectID]);

  const HeaderInfoButton = () => (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "ProjectInfo",
          params: { projectID: project.project_id },
        })
      }
      style={{
        padding: 8,
        borderRadius: 8,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
      }}
    >
      <AntDesign name="info-circle" size={20} color="white" />
    </Pressable>
  );

  const HeaderAddTaskButton = () => (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "AddTask",
          params: { projectID: project.project_id },
        })
      }
      style={{
        padding: 8,
        borderRadius: 8,
        backgroundColor: theme.colors.primary[500],
        marginRight: 8,
      }}
    >
      <Entypo name="plus" size={20} color="white" />
    </Pressable>
  );

  const HeaderRight = () => (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <HeaderAddTaskButton />
      <HeaderInfoButton />
    </View>
  );

  const HeaderTitle = () => (
    <View style={{ flex: 1 }}>
      <Text
        style={{
          color: "white",
          fontSize: 20,
          fontWeight: "bold",
          marginBottom: 4,
        }}
      >
        {project?.name}
      </Text>
      {totalTasks > 0 && (
        <Text
          style={{
            color: "rgba(255, 255, 255, 0.8)",
            fontSize: 14,
          }}
        >
          {totalTasks} tarefa{totalTasks !== 1 ? "s" : ""} •{" "}
          {Math.round((completedTasks / totalTasks) * 100)}% concluído
        </Text>
      )}
    </View>
  );

  if (!project) return null;

  return (
    <Content.Wrapper>
      <Content.Header
        right={<HeaderRight />}
        title={<HeaderTitle />}
        left={<Content.BackButton onPress={() => router.replace("/")} />}
      />
      <Content.Body>
        <Slot />
      </Content.Body>
    </Content.Wrapper>
  );
};

export default ProjectLayout;
