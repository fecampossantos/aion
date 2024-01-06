import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  container: {
    width: "100%",
    height: 60,
    borderColor: "black",
    borderWidth: 2,
    borderRadius: 20,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  textInput: {
    width: "80%",
    height: "100%",
  },
});

export default styles;
