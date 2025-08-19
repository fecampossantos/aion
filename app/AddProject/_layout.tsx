import { router, Slot } from "expo-router";
import Content from "../../components/Content";

const AddProjectLayout = () => {
  return (
    <Content.Wrapper>
      <Content.Header left={<Content.BackButton onPress={router.back} />} title={"Novo projeto"} />
      <Content.Body>
        <Slot />
      </Content.Body>
    </Content.Wrapper>
  );
};

export default AddProjectLayout;
