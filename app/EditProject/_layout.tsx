import { Slot } from "expo-router";
import Content from "../../components/Content";

const EditProjectLayout = () => {
  return (
    <Content.Wrapper>
      <Content.Header title={"Novo tempo"} />
      <Content.Body>
        <Slot />
      </Content.Body>
    </Content.Wrapper>
  );
};

export default EditProjectLayout;
