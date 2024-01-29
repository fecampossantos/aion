import { StyleSheet } from "react-native";
import globalStyle from "../../globalStyle";

const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: globalStyle.background,
    paddingHorizontal: 12,
    textAlign: "center",
    width: "100%",
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
  noTasksWarning: {
    color: "white",
    width: "100%",
    textAlign: "center",
    marginTop: 50
  },
});

export default styles;
