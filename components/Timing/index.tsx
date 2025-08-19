import { Text, Pressable, View, StyleSheet } from "react-native";
import { Timing as ITiming } from "../../interfaces/Timing";
import { secondsToTimeHHMMSS, fullDateWithHour } from "../../utils/parser";

import { Feather } from "@expo/vector-icons";
import { theme } from "../../globalStyle/theme";

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.neutral[800],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...theme.shadows.sm,
  },
  text: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.md,
  },
});

/**
 * Timing component displays timing information with delete functionality
 * @param {Object} props - Component properties
 * @param {ITiming} props.timing - The timing data to display
 * @param {() => void} props.deleteTiming - Function to delete the timing
 * @param {boolean} props.isTimerRunning - Whether a timer is currently running
 * @returns {JSX.Element} A timing display with date, time, and delete button
 */
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

      <Pressable onPress={() => handleDeleteTiming()}>
        <Feather
          name="trash"
          size={24}
          color={isTimerRunning ? theme.colors.neutral[400] : theme.colors.white}
        />
      </Pressable>
    </View>
  );
};

export default Timing;
