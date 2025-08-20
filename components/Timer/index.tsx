import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { AntDesign, Feather } from "@expo/vector-icons";
import { theme } from "../../globalStyle/theme";
import { useTimer } from "./useTimer";

const styles = StyleSheet.create({
  timerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  stopButton: {
    width: 32,
    height: 32,
    borderColor: theme.colors.error[500],
    borderWidth: 2,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.error[600],
    justifyContent: "center",
    alignItems: "center",
    ...theme.shadows.sm,
  },
  timerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.lg,
  },
  timerDisplay: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize['3xl'],
    fontFamily: theme.typography.fontFamily.bold,
    marginBottom: theme.spacing.lg,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  startButton: {
    width: 56,
    height: 56,
    borderColor: theme.colors.primary[500],
    borderWidth: 2,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary[600],
    justifyContent: "center",
    alignItems: "center",
    ...theme.shadows.lg,
  },
  pauseButton: {
    width: 48,
    height: 48,
    borderColor: theme.colors.warning[500],
    borderWidth: 2,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.warning[600],
    justifyContent: "center",
    alignItems: "center",
    ...theme.shadows.md,
  },

  disabledButton: {
    width: 48,
    height: 48,
    borderWidth: 2,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.neutral[800],
    borderColor: theme.colors.neutral[600],
    justifyContent: "center",
    alignItems: "center",
  },
  // Legacy styles for backward compatibility
  container: {
    width: 140,
    height: 56,
    borderColor: theme.colors.primary[500],
    borderWidth: 2,
    borderRadius: theme.borderRadius.full,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary[600],
    ...theme.shadows.lg,
  },
  disabledTimer: {
    width: 140,
    height: 56,
    borderWidth: 2,
    borderRadius: theme.borderRadius.full,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.neutral[800],
    borderColor: theme.colors.neutral[600],
  },
  text: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.bold,
  },
  disabledText: {
    color: theme.colors.neutral[400],
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.medium,
  },
});

interface TimerProps {
  onStop?: (timeInSeconds: number) => void;
  onInit?: () => void;
  disabled?: boolean;
  textToShowWhenStopped?: null | string;
  taskName?: string; // Added optional task name prop
}

/**
 * Timer component provides start, pause, and stop functionality with visual feedback
 * @param {TimerProps} props - Timer configuration and callbacks
 * @returns {JSX.Element} A touchable timer with start/pause controls and stop button
 */
const Timer = ({
  onStop = (time: number) => {},
  onInit = () => {},
  disabled = false,
  textToShowWhenStopped,
  taskName = "Task", // Default task name
}: TimerProps) => {
  const {
    isCounting,
    handleTouch,
    handleStop,
    getTimeToShow,
    getIconName,
  } = useTimer({
    disabled,
    taskName,
    onInit,
    onStop,
  });

  return (
    <View style={styles.timerWrapper}>
      <TouchableOpacity
        style={disabled ? styles.disabledTimer : styles.container}
        onPress={handleTouch}
        testID="timer-touchable"
      >
        <View>
          <AntDesign
            name={getIconName()}
            size={20}
            color={disabled ? theme.colors.neutral[400] : theme.colors.white}
          />
        </View>
        <Text style={disabled ? styles.disabledText : styles.text}>
          {getTimeToShow(textToShowWhenStopped)}
        </Text>
      </TouchableOpacity>
      
      {isCounting && (
        <TouchableOpacity
          style={styles.stopButton}
          onPress={handleStop}
          testID="timer-stop-button"
        >
          <Feather
            name="square"
            size={16}
            color={theme.colors.white}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Timer;
