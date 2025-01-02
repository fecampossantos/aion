import { useEffect, useState, useRef } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { AntDesign } from "@expo/vector-icons";
import styles from "./styles";
import globalStyle from "../../globalStyle";

interface TimerProps {
  onStop?: (timeInSeconds: number) => void;
  onInit?: () => void;
  disabled?: boolean;
  textToShowWhenStopped?: null | string;
  taskName?: string; // Added optional task name prop
}

const Timer = ({
  onStop = (time: number) => {},
  onInit = () => {},
  disabled = false,
  textToShowWhenStopped,
  taskName = "Task", // Default task name
}: TimerProps) => {
  const [isCounting, setIsCounting] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<string | null>(null);
  const notificationId = useRef<string | null>(null);

  const handleTouch = async () => {
    if (disabled) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isCounting) {
      // Stop timer
      setIsCounting(false);
      onStop(getSeconds());
      resetCount();

      // Dismiss notification
      if (notificationId.current) {
        await Notifications.dismissNotificationAsync(notificationId.current);
        notificationId.current = null;
      }
    } else {
      // Start timer
      const now = new Date();
      const formattedTime = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      setIsCounting(true);
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

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isCounting) {
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
  }, [isCounting]);

  return (
    <TouchableOpacity
      style={disabled ? styles.disabledTimer : styles.container}
      onPress={() => handleTouch()}
      testID="timer-touchable"
    >
      <View>
        <AntDesign
          name={isCounting ? "pause" : "caretright"}
          size={16}
          color={disabled ? globalStyle.black.light : globalStyle.white}
        />
      </View>
      <Text style={disabled ? styles.disabledText : styles.text}>
        {getTimeToShow()}
      </Text>
    </TouchableOpacity>
  );
};

export default Timer;
