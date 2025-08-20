import { router, Slot, useLocalSearchParams } from "expo-router";
import Content from "../../components/Content";

const ProjectInfoLayout = () => {
  const { projectID } = useLocalSearchParams();

  return (
    <Content.Wrapper>
      <Content.Header
        title={"Informações do projeto"}
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

export default ProjectInfoLayout;
