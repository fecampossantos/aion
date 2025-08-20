import { router, Slot, useLocalSearchParams } from "expo-router";
import Content from "../../components/Content";

const AddRecordLayout = () => {
  const { projectID } = useLocalSearchParams();

  return (
    <Content.Wrapper>
      <Content.Header
        title={"Novo tempo"}
        left={
          <Content.BackButton
            onPress={() =>
              router.back()
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

export default AddRecordLayout;
