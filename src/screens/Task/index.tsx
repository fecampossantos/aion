import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Task as ITask } from "../../../interfaces/Task";
import { useCallback, useEffect, useState } from "react";
import { database } from "../../../hooks/useDatabase/database";
import { Timing as ITiming } from "../../../interfaces/Timing";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import styles from "./styles";
import Timer from "../../components/Timer";
import Timing from "../../components/Timing";
import globalStyle from "../../globalStyle";

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
  const task: ITask = route.params.task;
  const [timings, setTimings] = useState<Array<ITiming>>([]);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  const handleDeleteTask = () => {
    if (isTimerRunning) return;
    database.deleteTaskById(task.task_id);
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

  useFocusEffect(
    useCallback(() => {
      database.getTimingsFromTask(task.task_id, setTimings);
    }, [isTimerRunning])
  );

  const handleDeleteTiming = (timingID: number) => {
    database.deleteTimingById(timingID);
    database.getTimingsFromTask(task.task_id, setTimings);
  };

  const onInitTimer = () => {
    setIsTimerRunning(true);
  };

  const onStopTimer = (time: number) => {
    setIsTimerRunning(false);
    database.addTiming(task.task_id, time);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Timer
          onInit={() => onInitTimer()}
          onStop={(time: number) => onStopTimer(time)}
        />
      </View>
      <ScrollView style={styles.timings}>
        {timings.length > 0 ? (
          timings.map((t: ITiming) => (
            <Timing
              timing={t}
              key={t.timing_id}
              deleteTiming={() => handleDeleteTiming(t.timing_id)}
              isTimerRunning={isTimerRunning}
            />
          ))
        ) : (
          <Text style={{ color: "white" }}>Sem timings pra essa task</Text>
        )}
      </ScrollView>
    </View>
  );
};

export default Task;
