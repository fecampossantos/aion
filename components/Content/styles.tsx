import { StyleSheet } from "react-native";
import { theme } from "../../globalStyle/theme";

const styles = StyleSheet.create({
  wrapper: { 
    flex: 1,
    backgroundColor: theme.colors.neutral[900],
  },
  header: {
    minHeight: 80,
    backgroundColor: theme.colors.neutral[900],
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[800],
  },
  body: { 
    flex: 1,
    backgroundColor: theme.colors.neutral[900],
  },
  button: {
    minWidth: theme.spacing['4xl'],
    height: theme.spacing['4xl'],
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  titleWrapper: {
    flex: 1,
    minHeight: theme.spacing['7xl'],
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingHorizontal: theme.spacing.md,
  },
  title: {
    textAlign: "left",
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.bold,
  }
});

export default styles;
