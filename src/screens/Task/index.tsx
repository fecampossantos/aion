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

const HeaderDeleteButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity onPress={onPress}>
    <Text>
      <Feather name="trash" size={24} color="white" />
    </Text>
  </TouchableOpacity>
);

const Task = ({ route, navigation }) => {
  const task: ITask = route.params.task;
  const [timings, setTimings] = useState<Array<ITiming>>([]);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  const handleDeleteTask = () => {
    database.deleteTaskById(task.task_id);
    navigation.goBack();
  };

  useEffect(() => {
    navigation.setOptions({
      title: task.name,
      headerRight: () => (
        <HeaderDeleteButton onPress={() => handleDeleteTask()} />
      ),
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      database.getTimingsFromTask(task.task_id, setTimings);
    }, [isTimerRunning])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Timer />
      </View>
      <ScrollView style={styles.timings}>
        {timings.length > 0 ? (
          timings.map((t: ITiming) => <Timing timing={t} key={t.timing_id} />)
        ) : (
          <Text style={{ color: "white" }}>Sem timings pra essa task</Text>
        )}
      </ScrollView>
    </View>
  );
};

export default Task;
