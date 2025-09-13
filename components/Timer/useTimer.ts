import { useState, useEffect, useRef } from "react";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { BackgroundTimer } from "../../utils/backgroundTimer";
import { AppState, AppStateStatus } from 'react-native';

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
  taskId = "",
  projectId = "",
  onInit = () => {},
  onStop = (time: number) => {},
}: {
  disabled?: boolean;
  taskName?: string;
  taskId?: string;
  projectId?: string;
  onInit?: () => void;
  onStop?: (time: number) => void;
}) => {
  const [isCounting, setIsCounting] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [timer, setTimer] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const notificationId = useRef<string | null>(null);
  const backgroundTimer = useRef<BackgroundTimer>(BackgroundTimer.getInstance());
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

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

      // Start background timer
      const id = await backgroundTimer.current.startTimer(taskName, taskId, projectId);
      notificationId.current = id;
    } else if (isPaused) {
      // Resume from pause
      setIsPaused(false);
      await backgroundTimer.current.resumeTimer();
    } else {
      // Pause timer
      setIsPaused(true);
      await backgroundTimer.current.pauseTimer();
    }
  };

  /**
   * Handles stopping the timer
   */
  const handleStop = async () => {
    if (disabled || !isCounting) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Stop background timer and get final time
    const totalSeconds = await backgroundTimer.current.stopTimer();
    
    // Update local state
    setIsCounting(false);
    setIsPaused(false);
    onStop(totalSeconds);
    resetCount();

    notificationId.current = null;
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
    if (!isCounting) return "caret-right";
    if (isPaused) return "caret-right";
    return "pause";
  };

  // Initialize background timer and sync with stored state
  useEffect(() => {
    const initializeTimer = async () => {
      await backgroundTimer.current.initialize();
      
      // Check if there's an existing timer running
      const isRunning = await backgroundTimer.current.isRunning();
      const currentTime = await backgroundTimer.current.getCurrentTime();
      
      if (isRunning && currentTime) {
        setIsCounting(true);
        setIsPaused(false);
        setTimer(currentTime);
      }
    };

    initializeTimer();
  }, []);

  // Timer update effect - sync with background timer
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isCounting && !isPaused) {
      intervalId = setInterval(async () => {
        const currentTime = await backgroundTimer.current.getCurrentTime();
        if (currentTime) {
          setTimer(currentTime);
        } else {
          // Background timer stopped, sync local state
          setIsCounting(false);
          setIsPaused(false);
          resetCount();
        }
      }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [isCounting, isPaused]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground, sync with background timer
        const isRunning = await backgroundTimer.current.isRunning();
        const currentTime = await backgroundTimer.current.getCurrentTime();
        
        if (isRunning && currentTime) {
          setIsCounting(true);
          setTimer(currentTime);
          
          const timerData = await backgroundTimer.current.getTimerData();
          if (timerData && !timerData.isRunning) {
            setIsPaused(true);
          } else {
            setIsPaused(false);
          }
        } else if (!isRunning) {
          setIsCounting(false);
          setIsPaused(false);
          resetCount();
        }
      }
      
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, []);

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
