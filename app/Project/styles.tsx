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
  noTasksWarning: {
    color: "white",
    width: "100%",
    textAlign: "center",
    marginTop: 50,
  },
  addButtonWrapper: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  addIconWrapper: { position: "relative", bottom: 0, right: 0, zIndex: 100 },
  addButtonIcon: {
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    height: 50,
    backgroundColor: globalStyle.white,
    borderRadius: 50,
    margin: 20,
  },
  addButtons: {
    position: "relative",
    bottom: 0,
    right: 30,
  },
  addButton: {
    width: 100,
    height: 50,
    backgroundColor: globalStyle.white,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default styles;
