import { ScrollView, Text, View } from "react-native";
import { useEffect, useState } from "react";
import { Timing as ITiming } from "../../interfaces/Timing";
import { useRouter, useLocalSearchParams } from "expo-router";

import styles from "./styles";
import Timer from "../../components/Timer";
import Timing from "../../components/Timing";
import { useSQLiteContext } from "expo-sqlite";
import LoadingView from "../../components/LoadingView";

const Task = () => {
  const router = useRouter();
  const { taskID } = useLocalSearchParams();
  const database = useSQLiteContext();
  const [timings, setTimings] = useState<Array<ITiming>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  const getTimingsFromTask = async () => {
    if (!taskID) return;
    const timings = await database.getAllAsync<ITiming>(
      "SELECT * FROM timings WHERE task_id = ? ORDER BY created_at DESC;",
      taskID as string
    );
    setTimings(timings);
    setIsLoading(false);
  };

  useEffect(() => {
    getTimingsFromTask();
  }, [taskID, isTimerRunning]);

  const handleDeleteTiming = async (timingID: number) => {
    await database.runAsync(
      "DELETE FROM timings WHERE timing_id = ?;",
      timingID
    );
    setIsLoading(true);
    await getTimingsFromTask(); // Refresh timings after deletion
  };

  const onInitTimer = () => {
    setIsTimerRunning(true);
  };

  const onStopTimer = async (time: number) => {
    setIsTimerRunning(false);
    await database.runAsync(
      "INSERT INTO timings (task_id, time) VALUES (?, ?);",
      taskID as string,
      time
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Timer onInit={onInitTimer} onStop={onStopTimer} />
      </View>
      {isLoading ? (
        <LoadingView />
      ) : (
        <ScrollView style={styles.timings}>
          {timings.length > 0 ? (
            timings.map((t: ITiming) => (
              <Timing
                timing={t}
                key={t.timing_id}
                deleteTiming={() => {
                  setIsLoading(true);
                  handleDeleteTiming(t.timing_id);
                }}
                isTimerRunning={isTimerRunning}
              />
            ))
          ) : (
            <View style={styles.noTimingsWarningContainer}>
              <Text style={styles.noTimingsWarningText}>
                Sem timings pra essa task
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default Task;
