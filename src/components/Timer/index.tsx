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
  const [isCounting, setIsCounting] = useState<boolean>(false);
  const [timer, setTimer] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let startTime: number;

    if (isCounting) {
      startTime = Date.now() - getSeconds() * 1000; // Adjust for current timer state

      intervalId = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setTimer({
          hours: Math.floor(elapsed / 3600),
          minutes: Math.floor((elapsed % 3600) / 60),
          seconds: elapsed % 60,
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
      setIsCounting(false);
      onStop(getSeconds());
      resetCount();
    } else {
      setIsCounting(true);
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
