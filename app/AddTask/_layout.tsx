import { Slot } from "expo-router";
import Content from "../../components/Content";

const AddTaskLayout = () => {
  return (
    <Content.Wrapper>
      <Content.Header title={"Nova task"} />
      <Content.Body>
        <Slot />
      </Content.Body>
    </Content.Wrapper>
  );
};

export default AddTaskLayout;
