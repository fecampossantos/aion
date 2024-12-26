import { View, Text, TouchableOpacity } from "react-native";

import { Project as IProject } from "../../../interfaces/Project";
import { useEffect, useState } from "react";
import { Feather } from "@expo/vector-icons";
import styles from "./styles";
import Button from "../../components/Button";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useSQLiteContext } from "expo-sqlite";
import globalStyle from "../../globalStyle";
import {
  formatJsDateToDatabase,
  fullDate,
  fullHour,
} from "../../../utils/parser";

import { Picker } from "@react-native-picker/picker";
import Task from "../../../interfaces/Task";
import TextInput from "../../components/TextInput";

const DateInput = ({ date, onPress }: { date: Date; onPress: () => void }) => {
  return (
    <View style={styles.dateInputWapper}>
      <Text style={styles.date}>{fullDate(date.toISOString())}</Text>
      <TouchableOpacity onPress={() => onPress()}>
        <Feather name="calendar" color="white" size={20} />
      </TouchableOpacity>
    </View>
  );
};

const TimeInput = ({
  time,
  onChange,
}: {
  time: string;
  onChange: (value: string) => void;
}) => {
  const formattedTime = `${time.slice(0, 2)}:${time.slice(2)}h`;
  return (
    <View>
      <TextInput
        keyboardType="numeric"
        value={formattedTime}
        onChangeText={onChange}
      />
    </View>
  );
};

const AddRecordModal = ({ route, navigation }) => {
  const database = useSQLiteContext();
  const project: IProject = route.params.project;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<any>();

  const [date, setDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const [startTime, setStartTime] = useState("1234");
  const [endTime, setEndTime] = useState("1234");

  async function getTasks() {
    const tasks = await database.getAllAsync<any>(
      "SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC;",
      project.project_id
    );

    setTasks(tasks);
  }

  useEffect(() => {
    navigation.setOptions({
      title: `Adicionar novo tempo`,
    });

    getTasks();
  }, []);

  const validTime = (value: string) => {
    const hours = parseInt(value.slice(0, 2));
    const minutes = parseInt(value.slice(2));

    if (hours > 23 || minutes > 59) return false;

    return true;
  };

  const getDifferenceInSeconds = () => {
    const hoursStart = parseInt(startTime.slice(0, 2));
    const minutesStart = parseInt(startTime.slice(2));

    const hoursEnd = parseInt(endTime.slice(0, 2));
    const minutesEnd = parseInt(endTime.slice(2));

    const hoursDiff = hoursEnd - hoursStart;
    const minutesDiff = minutesEnd - minutesStart;

    const diffInSeconds = hoursDiff * 3600 + minutesDiff * 60;

    return diffInSeconds;
  };

  const formatCreatedAt = () => {
    const newDate = new Date(date);
    const hoursStart = parseInt(startTime.slice(0, 2));
    const minutesStart = parseInt(startTime.slice(2));

    newDate.setHours(hoursStart);
    newDate.setMinutes(minutesStart);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);

    return newDate;
  };

  const handleAddRecord = async () => {
    if (selectedTask === undefined || selectedTask === "none_task") return;
    if (!validTime(startTime)) return;
    if (!validTime(endTime)) return;

    await database.runAsync(
      "INSERT INTO timings (task_id, time, created_at) VALUES (?, ?, ?);",
      selectedTask,
      getDifferenceInSeconds(),
      formatJsDateToDatabase(formatCreatedAt())
    );

    navigation.navigate("Project", { project });
  };

  const handleUpdateDate = (event, selectedDate) => {
    if (event.type !== "set") return;

    setDate(new Date(selectedDate));
    setShowPicker(false);
  };

  const handleChangeTime = (type: "start" | "end", value: string) => {
    const formattedTime = value.replace(/\D/g, "");

    if (formattedTime.length === 5) return;

    if (type === "start") {
      setStartTime(formattedTime);
    } else {
      setEndTime(formattedTime);
    }
  };

  return (
    <View style={styles.container}>
      <Picker
        selectedValue={selectedTask}
        onValueChange={(itemValue, itemIndex) => setSelectedTask(itemValue)}
        style={{
          color: "white",
          borderBottomColor: "white",
          borderBottomWidth: 1,
        }}
        dropdownIconColor={"white"}
      >
        <Picker.Item label="Selecione a task" value="none_task" />
        {tasks.map((task: Task) => (
          <Picker.Item
            label={task.name}
            value={task.task_id}
            key={task.task_id}
          />
        ))}
      </Picker>

      <View>
        <Text
          style={{
            color: globalStyle.white,
            fontFamily: globalStyle.font.regular,
          }}
        >
          Em
        </Text>
        <DateInput date={date} onPress={() => setShowPicker(true)} />
      </View>

      <View style={styles.dateButtonsWrapper}>
        <View style={styles.dateWrapper}>
          <Text
            style={{
              color: globalStyle.white,
              fontFamily: globalStyle.font.regular,
            }}
          >
            De
          </Text>
          <TimeInput
            onChange={(value) => handleChangeTime("start", value)}
            time={startTime}
          />
        </View>
        <View style={styles.dateWrapper}>
          <Text
            style={{
              color: globalStyle.white,
              fontFamily: globalStyle.font.regular,
            }}
          >
            Até
          </Text>
          <TimeInput
            onChange={(value) => handleChangeTime("end", value)}
            time={endTime}
          />
        </View>
      </View>

      <Button
        onPress={async () => await handleAddRecord()}
        text="Adicionar tempo"
      />

      {showPicker && (
        <DateTimePicker
          testID="timePicker"
          value={date || new Date()}
          mode={"date"}
          maximumDate={new Date()}
          onChange={(event, selectedDate) =>
            handleUpdateDate(event, selectedDate)
          }
        />
      )}
    </View>
  );
};

export default AddRecordModal;
