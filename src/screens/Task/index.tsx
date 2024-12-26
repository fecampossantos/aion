import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Task as ITask } from "../../../interfaces/Task";
import { useCallback, useEffect, useState } from "react";
import { Timing as ITiming } from "../../../interfaces/Timing";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

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

const Task = ({ route, navigation }) => {
  const database = useSQLiteContext();
  const task: ITask = route.params.task;
  const [timings, setTimings] = useState<Array<ITiming>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  useEffect(
    () =>
      navigation.addListener("beforeRemove", (e) => {
        if (!isTimerRunning) {
          // If we don't have unsaved changes, then we don't need to do anything
          return;
        }

        // Prevent default behavior of leaving the screen
        e.preventDefault();

        // Prompt the user before leaving the screen
        Alert.alert(
          "Parar timer?",
          "Seu timer ainda esta rodando. Se voce sair, perdera o tempo!",
          [
            { text: "Continuar aqui", style: "cancel", onPress: () => {} },
            {
              text: "Sair",
              style: "destructive",
              onPress: () => navigation.dispatch(e.data.action),
            },
          ]
        );
      }),
    [navigation, isTimerRunning]
  );

  const handleDeleteTask = () => {
    if (isTimerRunning) return;
    database.runAsync("DELETE FROM tasks WHERE task_id = ?;", task.task_id);
    navigation.goBack();
  };

  useEffect(() => {
    navigation.setOptions({
      title: task.name,
      headerRight: () => (
        <HeaderDeleteButton
          onPress={() => handleDeleteTask()}
          isTimerRunning={isTimerRunning}
        />
      ),
    });
  }, [isTimerRunning]);

  async function getTimingsFromTask() {
    const timings = await database.getAllAsync<ITiming>(
      "SELECT * FROM timings WHERE task_id = ? ORDER BY created_at DESC;",
      task.task_id
    );
    setTimings(timings);
    setIsLoading(false);
  }

  useFocusEffect(
    useCallback(() => {
      getTimingsFromTask();
    }, [isTimerRunning])
  );

  const handleDeleteTiming = async (timingID: number) => {
    await database.runAsync(
      "DELETE FROM timings WHERE timing_id = ?;",
      timingID
    );
    getTimingsFromTask();
  };

  const onInitTimer = () => {
    setIsTimerRunning(true);
  };

  const onStopTimer = async (time: number) => {
    setIsTimerRunning(false);
    await database.runAsync(
      "INSERT INTO timings (task_id, time) VALUES (?, ?);",
      task.task_id,
      time
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Timer
          onInit={() => onInitTimer()}
          onStop={(time: number) => onStopTimer(time)}
        />
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
    </View>
  );
};

export default Task;
