import { Dimensions, StyleSheet } from "react-native";
import globalStyle from "../../globalStyle";

const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: globalStyle.background,
    paddingHorizontal: globalStyle.padding.horizontal,
    gap: 30,
    paddingTop: 20,
  },

  dateInputWapper: {
    borderWidth: 1,
    borderColor: globalStyle.black.light,
    borderRadius: 4,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    marginBottom: 20,
  },
  date: {
    color: globalStyle.white,
    fontFamily: globalStyle.font.regular,
  },
  dateButtonsWrapper: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
  },

  dateWrapper: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    width: Dimensions.get("window").width / 2 - 36,
  },
});

export default styles;
