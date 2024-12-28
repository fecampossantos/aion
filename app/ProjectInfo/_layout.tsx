import { Slot } from "expo-router";
import Content from "../../components/Content";

const ProjectInfoLayout = () => {
  return (
    <Content.Wrapper>
      <Content.Header title={"Informações do projeto"} />
      <Content.Body>
        <Slot />
      </Content.Body>
    </Content.Wrapper>
  );
};

export default ProjectInfoLayout;
