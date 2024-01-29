import { StyleSheet } from "react-native";
import globalStyle from "../../globalStyle";

const styles = StyleSheet.create({
  input: {
    fontSize: 26,
    fontFamily: globalStyle.font.regular,
    color: globalStyle.white,
    borderBottomColor: globalStyle.white,
    borderBottomWidth: 1,
  },
  wrapper: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
});

export const placeHolderColor = globalStyle.black.light;

export default styles;
