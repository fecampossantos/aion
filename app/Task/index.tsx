import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Task as ITask } from "../../interfaces/Task";
import { useCallback, useEffect, useState } from "react";
import { Timing as ITiming } from "../../interfaces/Timing";
import { Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";

import styles from "./styles";
import Timer from "../../components/Timer";
import Timing from "../../components/Timing";
import globalStyle from "../../globalStyle";
import { useSQLiteContext } from "expo-sqlite";
import LoadingView from "../../components/LoadingView";

const HeaderDeleteButton = ({
  onPress,
  isTimerRunning,
}: {
  onPress: () => void;
  isTimerRunning: boolean;
}) => (
  <TouchableOpacity onPress={onPress}>
    <Text>
      <Feather
        name="trash"
        size={24}
        color={isTimerRunning ? globalStyle.black.light : "white"}
      />
    </Text>
  </TouchableOpacity>
);

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

  const handleDeleteTask = () => {
    if (isTimerRunning) return;
    database.runAsync("DELETE FROM tasks WHERE task_id = ?;", taskID as string);
    router.back(); // Replaces navigation.goBack()
  };

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
            <Text style={{ color: "white" }}>Sem timings pra essa task</Text>
          )}
        </ScrollView>
      )}
      <HeaderDeleteButton
        onPress={handleDeleteTask}
        isTimerRunning={isTimerRunning}
      />
    </View>
  );
};

export default Task;
