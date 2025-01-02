import { router, Slot, useLocalSearchParams } from "expo-router";
import Content from "../../components/Content";

const AddTaskLayout = () => {
  const { projectID } = useLocalSearchParams();

  return (
    <Content.Wrapper>
      <Content.Header
        title={"Nova task"}
        left={
          <Content.BackButton
            onPress={() =>
              router.replace({
                pathname: "Project",
                params: { projectID },
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

export default AddTaskLayout;
