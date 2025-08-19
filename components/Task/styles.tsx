import { StyleSheet } from "react-native";
import { theme } from "../../globalStyle/theme";

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.neutral[800],
    borderRadius: theme.borderRadius.lg,
    marginVertical: theme.spacing.xs,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary[500],
    ...theme.shadows.sm,
  },
  name: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.medium,
    marginLeft: theme.spacing.sm,
  },
  touchableContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
    minHeight: 40,
    paddingRight: theme.spacing.sm,
  },
  checkBoxWrapper: {
    borderRightColor: theme.colors.neutral[600],
    borderRightWidth: 1,
    paddingRight: 0,
  },
  strikeThrough: {
    textDecorationLine: "line-through",
    textDecorationStyle: "solid",
    color: theme.colors.neutral[400],
  },
});

export default styles;
