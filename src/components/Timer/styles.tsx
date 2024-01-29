import { StyleSheet } from "react-native";
import globalStyle from "../../globalStyle";

const styles = StyleSheet.create({
  container: {
    width: 120,
    height: 40,
    borderColor: globalStyle.white,
    borderWidth: 1,
    borderRadius: 100,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  disabledTimer: {
    width: 120,
    height: 40,
    borderWidth: 1,
    borderRadius: 100,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 4,
    paddingVertical: 4,

    backgroundColor: globalStyle.black.dark,
    borderColor: globalStyle.black.dark,
  },

  text: {
    color: globalStyle.white,
  },
  disabledText: {
    color: globalStyle.black.light,
  },
});

export default styles;
