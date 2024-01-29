import { StyleSheet } from "react-native";
import globalStyle from "../../globalStyle";
import { Dimensions } from "react-native";

const styles = StyleSheet.create({
  container: {
    backgroundColor: globalStyle.background,
    height: "100%",
    paddingHorizontal: globalStyle.padding.horizontal,
    flex: 1
  },
  datesWrapper: {},
  dateButtonsWrapper: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
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
    marginBottom: 20
  },
  date: {
    color: globalStyle.white,
    fontFamily: globalStyle.font.regular,
  },
  dateWrapper: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    width: Dimensions.get("window").width / 2 - 36,
  },
  dangerZone: {
    borderTopColor: "red",
    borderTopWidth: 1,
    paddingVertical: 20,
    marginTop: 40,
    gap: 12
  },
  projectInfoWrapper: {
    paddingBottom: 40,
  },
});

export default styles;
