import { useEffect, useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import * as Haptics from "expo-haptics";
import { AntDesign } from "@expo/vector-icons";

import styles from "./styles";
import globalStyle from "../../globalStyle";

interface TimerProps {
  onStop?: (timeInSeconds: number) => void;
  onInit?: () => void;
  disabled?: boolean;
  textToShowWhenStopped?: null | string;
}

const Timer = ({
  onStop = (time: number) => {},
  onInit = () => {},
  disabled = false,
  textToShowWhenStopped,
}: TimerProps) => {
  const [isCounting, setIsCouting] = useState<boolean>(false);

  const [timer, setTimer] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    let intervalId: string | number | NodeJS.Timeout;

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

  const getSeconds = () => {
    return timer.hours * 3600 + timer.minutes * 60 + timer.seconds;
  };

  const resetCount = () => {
    setTimer({ hours: 0, minutes: 0, seconds: 0 });
  };

  const handleTouch = () => {
    if (disabled) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isCounting) {
      setIsCouting(false);
      resetCount();
      onStop(getSeconds());
    } else {
      setIsCouting(true);
      onInit();
    }
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
