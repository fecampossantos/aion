import { StyleSheet } from "react-native";
import globalStyle from "../../globalStyle";
import { theme } from "../../globalStyle/theme";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[900],
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 32,
    gap: 16,
  },
  title: {
    color: globalStyle.white,
    fontSize: 28,
    fontFamily: globalStyle.font.bold,
    textAlign: "center",
  },
  subtitle: {
    color: globalStyle.white,
    fontSize: 16,
    fontFamily: globalStyle.font.regular,
    textAlign: "center",
    opacity: 0.8,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: globalStyle.black.light,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: globalStyle.black.main,
  },
  formSection: {
    gap: 24,
  },
  inputGroup: {
    gap: 12,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  label: {
    color: globalStyle.white,
    fontFamily: globalStyle.font.medium,
    fontSize: 16,
  },
  input: {
    backgroundColor: globalStyle.black.main,
    borderWidth: 1,
    borderColor: globalStyle.black.light,
    borderRadius: 12,
    padding: 16,
    color: globalStyle.white,
    fontFamily: globalStyle.font.regular,
    fontSize: 16,
    minHeight: 56,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "#ef4444",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  errorMessage: {
    color: "#ef4444",
    fontFamily: globalStyle.font.medium,
    fontSize: 14,
    flex: 1,
  },
  actionSection: {
    alignItems: "center",
    paddingBottom: 40,
  },
  saveButton: {
    minWidth: 200,
    height: 56,
    borderRadius: 16,
  },
});

export const inputColor = globalStyle.white;

export default styles;
