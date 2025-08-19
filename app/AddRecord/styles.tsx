import { Dimensions, StyleSheet } from "react-native";
import globalStyle from "../../globalStyle";
import { colors, spacing, borderRadius, shadows, typography } from "../../globalStyle/theme";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[900],
    paddingHorizontal: globalStyle.padding.horizontal,
    paddingTop: spacing.xl,
    paddingBottom: spacing['2xl'],
  },

  // Header section
  header: {
    marginBottom: spacing['3xl'],
  },
  headerTitle: {
    color: globalStyle.white,
    fontFamily: globalStyle.font.bold,
    fontSize: typography.fontSize['2xl'],
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    color: colors.neutral[400],
    fontFamily: globalStyle.font.regular,
    fontSize: typography.fontSize.md,
  },

  // Task picker section
  pickerSection: {
    marginBottom: spacing['3xl'],
  },
  pickerLabel: {
    color: globalStyle.white,
    fontFamily: globalStyle.font.medium,
    fontSize: typography.fontSize.md,
    marginBottom: spacing.md,
  },
  selectedTaskIndicator: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
    backgroundColor: colors.success[500],
    borderRadius: borderRadius.full,
    width: 8,
    height: 8,
    zIndex: 1,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.neutral[600],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.neutral[800],
    ...shadows.sm,
    overflow: 'hidden',
  },
  pickerContainerFocused: {
    borderColor: colors.primary[500],
    ...shadows.md,
  },
  picker: {
    color: colors.white,
    height: 56,
    paddingHorizontal: spacing.lg,
    backgroundColor: 'transparent',
  },
  pickerItem: {
    backgroundColor: colors.neutral[800],
    color: globalStyle.white,
    fontSize: typography.fontSize.md,
    fontFamily: globalStyle.font.medium,
  },
  pickerItemSelected: {
    backgroundColor: colors.primary[600],
    color: globalStyle.white,
  },
  pickerDropdownIcon: {
    tintColor: colors.neutral[400],
    marginRight: spacing.md,
  },
  dateSection: {
    marginBottom: spacing['3xl'],
  },
  dateLabel: {
    color: globalStyle.white,
    fontFamily: globalStyle.font.medium,
    fontSize: typography.fontSize.md,
    marginBottom: spacing.md,
  },
  dateInputWapper: {
    borderWidth: 1,
    borderColor: colors.neutral[600],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.neutral[800],
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    ...shadows.sm,
  },
  date: {
    color: globalStyle.white,
    fontFamily: globalStyle.font.medium,
    fontSize: typography.fontSize.lg,
  },
  calendarButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[600],
    ...shadows.sm,
  },

  // Time section
  timeSection: {
    marginBottom: spacing['3xl'],
  },
  timeSectionTitle: {
    color: globalStyle.white,
    fontFamily: globalStyle.font.medium,
    fontSize: typography.fontSize.md,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  dateButtonsWrapper: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.lg,
  },
  dateWrapper: {
    flex: 1,
    alignItems: "center",
  },
  timeLabel: {
    color: globalStyle.white,
    fontFamily: globalStyle.font.medium,
    fontSize: typography.fontSize.md,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  timeInputContainer: {
    width: '100%',
    alignItems: 'center',
  },

  // Button section
  buttonSection: {
    marginTop: 'auto',
    paddingTop: spacing['2xl'],
  },

  // Form group styling
  formGroup: {
    marginBottom: spacing['2xl'],
  },
  formLabel: {
    color: globalStyle.white,
    fontFamily: globalStyle.font.medium,
    fontSize: typography.fontSize.md,
    marginBottom: spacing.md,
  },
});

export default styles;
