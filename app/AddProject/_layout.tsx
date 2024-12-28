import { Slot } from "expo-router";
import Content from "../../components/Content";

const AddProjectLayout = () => {
  return (
    <Content.Wrapper>
      <Content.Header />
      <Content.Body>
        <Slot />
      </Content.Body>
    </Content.Wrapper>
  );
};

export default AddProjectLayout;
