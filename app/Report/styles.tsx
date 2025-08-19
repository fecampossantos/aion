import { Dimensions, StyleSheet } from "react-native";
import globalStyle from "../../globalStyle";
import { theme } from "../../globalStyle/theme";

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.neutral[900],
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 24,
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
  dateSection: {
    marginBottom: 32,
    gap: 20,
  },
  sectionTitle: {
    color: globalStyle.white,
    fontSize: 18,
    fontFamily: globalStyle.font.medium,
    marginBottom: 8,
  },
  dateInputsContainer: {
    gap: 20,
  },
  dateInputContainer: {
    gap: 8,
  },
  dateLabel: {
    color: globalStyle.white,
    fontSize: 14,
    fontFamily: globalStyle.font.medium,
    opacity: 0.9,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: globalStyle.black.light,
    borderRadius: 12,
    padding: 16,
    backgroundColor: globalStyle.black.main,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 56,
  },
  dateInputActive: {
    borderColor: globalStyle.white,
    borderWidth: 2,
    backgroundColor: globalStyle.black.light,
  },
  dateContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dateText: {
    color: globalStyle.white,
    fontSize: 16,
    fontFamily: globalStyle.font.medium,
  },
  chevronIcon: {
    opacity: 0.7,
  },
  summaryCard: {
    backgroundColor: globalStyle.black.light,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: globalStyle.black.main,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  summaryTitle: {
    color: globalStyle.white,
    fontSize: 18,
    fontFamily: globalStyle.font.medium,
  },
  summaryContent: {
    gap: 16,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: globalStyle.black.main,
  },
  summaryLabel: {
    color: globalStyle.white,
    fontSize: 14,
    fontFamily: globalStyle.font.regular,
    opacity: 0.8,
  },
  summaryValue: {
    color: globalStyle.white,
    fontSize: 16,
    fontFamily: globalStyle.font.medium,
  },
  actionSection: {
    alignItems: "center",
    gap: 20,
    paddingBottom: 40,
  },
  generateButton: {
    minWidth: 200,
    height: 56,
    borderRadius: 16,
    backgroundColor: globalStyle.white,
  },
  loadingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: globalStyle.black.light,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: globalStyle.black.main,
  },
  loadingText: {
    color: globalStyle.white,
    fontSize: 14,
    fontFamily: globalStyle.font.regular,
    opacity: 0.8,
  },
});

export default styles;
