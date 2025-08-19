import { StyleSheet } from "react-native";
import globalStyle from "../../globalStyle";
import { theme } from "../../globalStyle/theme";
import { Dimensions } from "react-native";

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.neutral[900],
    flex: 1,
    paddingHorizontal: globalStyle.padding.horizontal,
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
  projectStatsCard: {
    backgroundColor: globalStyle.black.light,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: globalStyle.black.main,
  },
  projectStatsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  projectStatsTitle: {
    color: globalStyle.white,
    fontSize: 18,
    fontFamily: globalStyle.font.medium,
  },
  projectStatsContent: {
    gap: 16,
  },
  projectStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: globalStyle.black.main,
  },
  projectStatIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: globalStyle.black.main,
    alignItems: "center",
    justifyContent: "center",
  },
  projectStatText: {
    flex: 1,
  },
  projectStatLabel: {
    color: globalStyle.white,
    fontSize: 14,
    fontFamily: globalStyle.font.regular,
    opacity: 0.8,
    marginBottom: 4,
  },
  projectStatValue: {
    color: globalStyle.white,
    fontSize: 18,
    fontFamily: globalStyle.font.medium,
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
  chartSection: {
    marginBottom: 32,
    padding: 20,
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  chartTitle: {
    color: globalStyle.white,
    fontSize: 18,
    fontFamily: globalStyle.font.medium,
  },
  chartContainer: {
    alignItems: "center",
  },
  chart: {
    borderRadius: 12,
  },
  actionSection: {
    alignItems: "center",
    gap: 20,
    marginBottom: 32,
  },
  generateReportButton: {
    minWidth: 200,
    height: 56,
    borderRadius: 16,
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
  dangerZone: {
    borderTopColor: globalStyle.white,
    borderTopWidth: 1,
    paddingVertical: 20,
    marginTop: 20,
    gap: 16,
  },
  dangerZoneTitle: {
    color: globalStyle.white,
    fontSize: 18,
    fontFamily: globalStyle.font.medium,
    textAlign: "center",
    marginBottom: 8,
  },
  dangerZoneButtons: {
    gap: 12,
  },
  editButton: {
    backgroundColor: globalStyle.black.light,
    height: 48,
    borderRadius: 12,
  },
  deleteButton: {
    backgroundColor: "#dc2626",
    height: 48,
    borderRadius: 12,
  },
});

export const chartConfig = {
  backgroundGradientFrom: theme.colors.neutral[900],
  backgroundGradientTo: theme.colors.neutral[900],
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  barPercentage: 0.5,
};

export default styles;
