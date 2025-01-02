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
  noTimingsWarningContainer:{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 20
  },
  noTimingsWarningText: {
    color: globalStyle.black.light,
    fontFamily: globalStyle.font.italicRegular,
    fontSize: 20,
  },
});

export default styles;
