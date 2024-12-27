import { StyleSheet } from "react-native";
import globalStyle from "../../globalStyle";

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 2,
    borderColor: globalStyle.black.light,
    display: "flex",
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },
  text: {
    color: globalStyle.white,
  },
});

export default styles;
