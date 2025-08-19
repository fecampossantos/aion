import { useEffect, useState, useRef } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { AntDesign, Feather } from "@expo/vector-icons";
import { theme } from "../../globalStyle/theme";

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
  const [isCounting, setIsCounting] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<string | null>(null);
  const notificationId = useRef<string | null>(null);

  const handleTouch = async () => {
    if (disabled) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (!isCounting) {
      // Start timer
      const now = new Date();
      const formattedTime = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      setIsCounting(true);
      setIsPaused(false);
      setStartTime(formattedTime);
      onInit();

      // Show notification
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Timer for ${taskName} running`,
          body: `Started at ${formattedTime}`,
        },
        trigger: null, // Immediate notification
      });
      notificationId.current = id;
    } else if (isPaused) {
      // Resume from pause
      setIsPaused(false);
    } else {
      // Pause timer
      setIsPaused(true);
    }
  };

  const handleStop = async () => {
    if (disabled || !isCounting) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Stop timer
    setIsCounting(false);
    setIsPaused(false);
    onStop(getSeconds());
    resetCount();

    // Dismiss notification
    if (notificationId.current) {
      await Notifications.dismissNotificationAsync(notificationId.current);
      notificationId.current = null;
    }
  };

  const resetCount = () => {
    setStartTime(null);
    setTimer({ hours: 0, minutes: 0, seconds: 0 });
  };

  const [timer, setTimer] = useState({ hours: 0, minutes: 0, seconds: 0 });

  const getSeconds = () => {
    return timer.hours * 3600 + timer.minutes * 60 + timer.seconds;
  };

  const formatNumber = (number: number): string => {
    return String(number).padStart(2, "0");
  };

  const getTimeToShow = () => {
    if (!isCounting && textToShowWhenStopped) return textToShowWhenStopped;

    return `${formatNumber(timer.hours)}:${formatNumber(
      timer.minutes
    )}:${formatNumber(timer.seconds)}`;
  };

  const getIconName = () => {
    if (!isCounting) return "caretright";
    if (isPaused) return "caretright";
    return "pause";
  };

  useEffect(() => {
    let intervalId: number;

    if (isCounting && !isPaused) {
      intervalId = setInterval(() => {
        setTimer((prevTimer) => {
          const seconds = prevTimer.seconds + 1;
          const minutes = prevTimer.minutes + Math.floor(seconds / 60);
          const hours = prevTimer.hours + Math.floor(minutes / 60);

          return {
            hours: hours % 24,
            minutes: minutes % 60,
            seconds: seconds % 60,
          };
        });
      }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [isCounting, isPaused]);

  return (
    <View style={styles.timerWrapper}>
      <TouchableOpacity
        style={disabled ? styles.disabledTimer : styles.container}
        onPress={() => handleTouch()}
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
          {getTimeToShow()}
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
