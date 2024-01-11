import { StyleSheet } from "react-native";
import globalStyle from "../../globalStyle";

const styles = StyleSheet.create({
  input: {
    fontSize: 26,
    fontFamily: globalStyle.font.regular,
    color: globalStyle.white,
  },
  wrapper: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    display: "flex",
    flexDirection: "row",
    gap: 12,
  },
  currency: {
    fontSize: 26,
    fontFamily: globalStyle.font.regular,
    color: globalStyle.white,
  },
});

export const placeHolderColor = globalStyle.black.light;

export default styles;
