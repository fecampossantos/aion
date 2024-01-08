import { StyleSheet } from "react-native";
import globalStyle from "../../globalStyle";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: globalStyle.background,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 40,
  },
  header: {
    width: "100%",
    backgroundColor: globalStyle.background,
    height: 80,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    color: "white",
  },
  headerText: {
    color: globalStyle.white,
    fontFamily: globalStyle.font.bold,
    fontSize: 40,
  },
  addButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: globalStyle.white,
    borderRadius: 4,
    width: 30,
    height: 30,
  },
  projectsList: {
    width: "100%",
    display: "flex",
    gap: 20,
    paddingHorizontal: 20,
    marginTop: 20,
  },
});

export default styles;
