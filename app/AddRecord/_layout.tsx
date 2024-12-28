import { Slot } from "expo-router";
import Content from "../../components/Content";

const AddRecordLayout = () => {
  return (
    <Content.Wrapper>
      <Content.Header title={"Novo tempo"} />
      <Content.Body>
        <Slot />
      </Content.Body>
    </Content.Wrapper>
  );
};

export default AddRecordLayout;
