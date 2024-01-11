import { Text, View } from "react-native";
import styles from "./styles";
import { Timing as ITiming } from "../../../interfaces/Timing";
import { secondsToTimeHHMMSS, fullDateWithHour } from "../../../utils/parser";

const Timing = ({ timing }: { timing: ITiming }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{fullDateWithHour(timing.created_at)}</Text>
      <Text style={styles.text}>{secondsToTimeHHMMSS(timing.time)}</Text>
    </View>
  );
};

export default Timing;
