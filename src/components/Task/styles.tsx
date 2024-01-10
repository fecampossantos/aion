import { StyleSheet } from "react-native";
import globalStyle from "../../globalStyle";

const styles = StyleSheet.create({
  container: {
    borderColor: globalStyle.black.light,
    borderBottomWidth: 2,
    display:"flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 12
  },
  name: {
    color: globalStyle.white,
  },
});

export default styles;
