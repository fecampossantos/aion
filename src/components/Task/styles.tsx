import { StyleSheet } from "react-native";
import globalStyle from "../../globalStyle";

const styles = StyleSheet.create({
  container: {
    borderColor: globalStyle.black.light,
    borderBottomWidth: 2,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    // paddingHorizontal: 10,
    paddingVertical: 12,
  },
  name: {
    color: globalStyle.white,
  },
  touchableContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    flex: 1,
  },
  checkBoxWrapper: {
    paddingHorizontal: 6,
    borderRightColor: globalStyle.white,
    borderRightWidth: 1,
  },
  strikeThrough: {
    textDecorationLine: "line-through",
    textDecorationStyle: "solid",
  },
});

export default styles;
