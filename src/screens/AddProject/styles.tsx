import { StyleSheet } from "react-native";
import globalStyle from "../../globalStyle";
const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: globalStyle.background,
    paddingHorizontal: 20,
  },
  label: {
    color: globalStyle.white,
    fontFamily: globalStyle.font.medium,
    fontSize: 20,
  },
  input: {
    color: globalStyle.white,
    fontFamily: globalStyle.font.medium,
    fontSize: 20,
  },
  projectInfoWrapper: {
    padding: 40,
    gap: 20
  },
});

export const inputColor = globalStyle.white;

export default styles;
