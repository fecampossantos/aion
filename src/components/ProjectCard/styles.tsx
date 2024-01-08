import { StyleSheet } from "react-native";
import globalStyle from "../../globalStyle";

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 60,
    borderColor: globalStyle.white,
    borderWidth: 1,
    borderRadius: 20,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  projectName: {
    color: globalStyle.white,
    fontFamily: globalStyle.font.medium,
    fontSize: 20
  },
});

export default styles;
