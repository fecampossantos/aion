import { StyleSheet } from "react-native";
import globalStyle from "../../globalStyle";

const styles = StyleSheet.create({
  button: {
    borderColor: globalStyle.black.light,
    borderWidth: 2,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  text: { color: globalStyle.white, fontFamily: globalStyle.font.bold },
});

export default styles;
