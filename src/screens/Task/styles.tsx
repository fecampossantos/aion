import { StyleSheet } from "react-native";
import globalStyle from "../../globalStyle";

const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: globalStyle.background,
  },
  header: {
    paddingVertical: 30,
    justifyContent: "center",
    alignItems: "center",
    borderBottomColor: globalStyle.white,
    borderBottomWidth: 1,
  },
  timings: {
    paddingHorizontal: globalStyle.padding.horizontal,
  },
});

export default styles;
