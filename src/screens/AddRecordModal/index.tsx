import { View, Text, TouchableOpacity } from "react-native";

import { Project as IProject } from "../../../interfaces/Project";
import { useEffect, useState } from "react";
import { Feather } from "@expo/vector-icons";
import styles from "./styles";
import Button from "../../components/Button";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useSQLiteContext } from "expo-sqlite/next";
import globalStyle from "../../globalStyle";
import {
  formatJsDateToDatabase,
  fullDate,
  fullHour,
} from "../../../utils/parser";

import { Picker } from "@react-native-picker/picker";
import Task from "../../../interfaces/Task";

const DateTimeInput = ({
  date,
  onPress,
  type = "date",
}: {
  date: Date;
  onPress: () => void;
  type?: "date" | "time";
}) => {
  const textToShow =
    type === "date"
      ? fullDate(date.toISOString())
      : fullHour(date.toISOString());
  return (
    <View style={styles.dateInputWapper}>
      <Text style={styles.date}>{textToShow}</Text>
      <TouchableOpacity onPress={() => onPress()}>
        <Feather name="calendar" color="white" size={20} />
      </TouchableOpacity>
    </View>
  );
};

const AddRecordModal = ({ route, navigation }) => {
  const database = useSQLiteContext();
  const project: IProject = route.params.project;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<any>();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(new Date());
  const [timeShown, setTimeShown] = useState<"start" | "end" | null>(null);
  const [timePickerValue, setTimePickerValue] = useState(null);

  async function getTasks() {
    const tasks = await database.getAllAsync<any>(
      "SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC;",
      project.project_id
    );

    setTasks(tasks);
  }

  useEffect(() => {
    navigation.setOptions({
      title: `Adicionar novo tempo em ${project.name}`,
    });

    getTasks();
  }, []);

  const handleAddRecord = async () => {
    await database.runAsync(
      "INSERT INTO timings (task_id, time, created_at) VALUES (?, ?);",
      selectedTask.task_id,
      0, // add time here
      formatJsDateToDatabase(date)
    );
    navigation.navigate("Project", { project });
  };

  const handleUpdateDate = (event, selectedDate) => {
    if (event.type !== "set") return;
    setDate(new Date(selectedDate));
    setShowDatePicker(false);
  };

  const handleUpdateTime = (event, selectedTime) => {
    if (event.type !== "set") return;

    const dt = new Date(selectedTime);
    if (timeShown === "start") {
      setStartTime(new Date(dt));
    } else {
      setEndTime(new Date(dt));
    }
    setShowTimePicker(false);
  };

  const handleShowTimePicker = (timeValue: "start" | "end") => {
    setTimeShown(timeValue);
    setTimePickerValue(timeValue === "start" ? startTime : endTime);
    setShowTimePicker(true);
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
        <DateTimeInput date={date} onPress={() => setShowDatePicker(true)} />
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
          <DateTimeInput
            date={startTime}
            onPress={() => handleShowTimePicker("start")}
            type="time"
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
          <DateTimeInput
            date={endTime}
            onPress={() => handleShowTimePicker("end")}
            type="time"
          />
        </View>
      </View>

      <Button
        onPress={async () => await handleAddRecord()}
        text="Adicionar tempo"
      />
      {showDatePicker && (
        <DateTimePicker
          testID="datePicker"
          value={date || new Date()}
          mode={"date"}
          is24Hour={true}
          onChange={(event, selectedDate) =>
            handleUpdateDate(event, selectedDate)
          }
          maximumDate={new Date()}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          testID="timePicker"
          value={timePickerValue || new Date()}
          mode={"time"}
          onChange={(event, selectedDate) =>
            handleUpdateTime(event, selectedDate)
          }
        />
      )}
    </View>
  );
};

export default AddRecordModal;
