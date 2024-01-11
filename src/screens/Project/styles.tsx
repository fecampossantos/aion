import { StyleSheet } from "react-native";
import globalStyle from "../../globalStyle";

const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: globalStyle.background,
    paddingHorizontal: 12
  },
  addTaskButton: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 50,
    height: 50,
    backgroundColor: globalStyle.white,
    borderRadius: 50,
    margin: 20,
  },
});

export default styles;
