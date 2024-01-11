import { StyleSheet } from "react-native";
import globalStyle from "../../globalStyle";

const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: globalStyle.background,
    paddingHorizontal: globalStyle.padding.horizontal,
    gap: 30,
    paddingTop: 20
  },
});

export default styles;
