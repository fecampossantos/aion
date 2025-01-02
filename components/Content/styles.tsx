import { StyleSheet } from "react-native";
import globalStyle from "../../globalStyle";

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  header: {
    height: 50,
    backgroundColor: globalStyle.background,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  body: { flex: 1 },
  button: {
    width: 40,
    height: 40,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  titleWrapper: {
    flex: 1,
    height: 40,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  title:{textAlign: "center",
              fontSize: 20,
              color: globalStyle.white,
              fontFamily: globalStyle.font.bold,}
});

export default styles;
