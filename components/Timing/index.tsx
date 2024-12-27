import { Text, TouchableOpacity, View } from "react-native";
import styles from "./styles";
import { Timing as ITiming } from "../../interfaces/Timing";
import { secondsToTimeHHMMSS, fullDateWithHour } from "../../utils/parser";

import { Feather } from "@expo/vector-icons";
import { database } from "../../../hooks/useDatabase/database";
import globalStyle from "../../globalStyle";

const Timing = ({
  timing,
  deleteTiming,
  isTimerRunning,
}: {
  timing: ITiming;
  deleteTiming: () => void;
  isTimerRunning: boolean;
}) => {
  const { d, time } = fullDateWithHour(timing.created_at);

  const handleDeleteTiming = () => {
    if (isTimerRunning) return;
    deleteTiming();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {d} {time}h
      </Text>
      <Text style={styles.text}>{secondsToTimeHHMMSS(timing.time)}</Text>

      <TouchableOpacity onPress={() => handleDeleteTiming()}>
        <Feather
          name="trash"
          size={24}
          color={isTimerRunning ? globalStyle.black.light : "white"}
        />
      </TouchableOpacity>
    </View>
  );
};

export default Timing;
