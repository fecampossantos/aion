import { router, Slot, useLocalSearchParams } from "expo-router";
import Content from "../../components/Content";
import { Pressable, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";

const HeaderDeleteButton = ({
  projectID,
  taskID,
  database,
}: {
  projectID: string;
  taskID: string;
  database: SQLiteDatabase;
}) => {
  return (
    <Pressable
      onPress={() => {
        database.runAsync(
          "DELETE FROM tasks WHERE task_id = ?;",
          taskID as string
        );
        router.back();
      }}
    >
      <Text>
        <Feather name="trash" size={24} color={"white"} />
      </Text>
    </Pressable>
  );
};

const TaskLayout = () => {
  const { taskName, projectID, taskID } = useLocalSearchParams();
  const database = useSQLiteContext();

  return (
    <Content.Wrapper>
      <Content.Header
        title={taskName as string}
        right={
          <HeaderDeleteButton
            taskID={taskID as string}
            projectID={projectID as string}
            database={database}
          />
        }
        left={
          <Content.BackButton
            onPress={() =>
              router.replace({
                pathname: "/Project",
                params: { projectID: projectID }
              })
            }
          />
        }
      />
      <Content.Body>
        <Slot />
      </Content.Body>
    </Content.Wrapper>
  );
};

export default TaskLayout;
