import { useEffect, useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import * as Haptics from "expo-haptics";
import { AntDesign } from "@expo/vector-icons";

import styles from "./styles";

interface TimerProps {
  onStop?: (timeInSeconds: number) => void;
}

const Timer = ({ onStop }: TimerProps) => {
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

  const handleTouch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isCounting) {
      setIsCouting(false);
      if (onStop) onStop(getSeconds());
    } else {
      setIsCouting(true);
    }
  };

  const formatNumber = (number: number): string => {
    return String(number).padStart(2, "0");
  };

  return (
    <TouchableOpacity style={styles.container} onPress={() => handleTouch()}>
      <View>
        <AntDesign
          name={isCounting ? "pause" : "caretright"}
          size={16}
          color="black"
        />
      </View>
      <Text>
        {formatNumber(timer.hours)}:{formatNumber(timer.minutes)}:
        {formatNumber(timer.seconds)}
      </Text>
    </TouchableOpacity>
  );
};

export default Timer;
