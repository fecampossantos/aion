import { Slot } from "expo-router";
import Content from "../../components/Content";

const ReportLayout = () => {
  return (
    <Content.Wrapper>
      <Content.Header title={"Gerar report"} />
      <Content.Body>
        <Slot />
      </Content.Body>
    </Content.Wrapper>
  );
};

export default ReportLayout;
