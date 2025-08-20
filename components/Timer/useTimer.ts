import { useState, useEffect, useRef } from "react";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";

/**
 * Custom hook for managing timer functionality
 * @param {Object} options - Timer configuration options
 * @param {boolean} options.disabled - Whether the timer is disabled
 * @param {string} options.taskName - Name of the task for notifications
 * @param {Function} options.onInit - Callback when timer starts
 * @param {Function} options.onStop - Callback when timer stops
 * @returns {Object} Timer state and functions
 */
export const useTimer = ({
  disabled = false,
  taskName = "Task",
  onInit = () => {},
  onStop = (time: number) => {},
}: {
  disabled?: boolean;
  taskName?: string;
  onInit?: () => void;
  onStop?: (time: number) => void;
}) => {
  const [isCounting, setIsCounting] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [timer, setTimer] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const notificationId = useRef<string | null>(null);

  /**
   * Handles timer touch events (start, pause, resume)
   */
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

  /**
   * Handles stopping the timer
   */
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

  /**
   * Resets the timer count
   */
  const resetCount = () => {
    setStartTime(null);
    setTimer({ hours: 0, minutes: 0, seconds: 0 });
  };

  /**
   * Gets the total time in seconds
   */
  const getSeconds = () => {
    return timer.hours * 3600 + timer.minutes * 60 + timer.seconds;
  };

  /**
   * Formats a number with leading zeros
   */
  const formatNumber = (number: number): string => {
    return String(number).padStart(2, "0");
  };

  /**
   * Gets the time to display
   */
  const getTimeToShow = (textToShowWhenStopped?: string | null) => {
    if (!isCounting && textToShowWhenStopped) return textToShowWhenStopped;

    return `${formatNumber(timer.hours)}:${formatNumber(
      timer.minutes
    )}:${formatNumber(timer.seconds)}`;
  };

  /**
   * Gets the appropriate icon name based on timer state
   */
  const getIconName = () => {
    if (!isCounting) return "caretright";
    if (isPaused) return "caretright";
    return "pause";
  };

  // Timer effect
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

  return {
    isCounting,
    isPaused,
    startTime,
    timer,
    handleTouch,
    handleStop,
    getTimeToShow,
    getIconName,
  };
};
