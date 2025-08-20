import { Slot } from "expo-router";
import Content from "../../components/Content";

const EditProjectLayout = () => {
  return (
    <Content.Wrapper>
      <Content.Header title={"Editar Projeto"} />
      <Content.Body>
        <Slot />
      </Content.Body>
    </Content.Wrapper>
  );
};

export default EditProjectLayout;
