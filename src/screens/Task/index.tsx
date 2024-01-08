import { Text, TouchableOpacity, View } from "react-native";
import { Task as ITask } from "../../../interfaces/Task";
import { useCallback, useEffect, useState } from "react";
import { database } from "../../../hooks/useDatabase/database";
import Timing from "../../../interfaces/Timing";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

const HeaderDeleteButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity onPress={onPress}>
    <Text>
      <Feather name="trash" size={24} color="black" />
    </Text>
  </TouchableOpacity>
);

const Task = ({ route, navigation }) => {
  const task: ITask = route.params.task;
  const [timings, setTimings] = useState<Array<Timing>>([]);
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
    <View>
      <Text>{JSON.stringify(timings)}</Text>
    </View>
  );
};

export default Task;
