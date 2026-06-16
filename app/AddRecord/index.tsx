import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";

import { Project as IProject } from "../../interfaces/Project";
import { useEffect, useState } from "react";
import { Feather } from "@expo/vector-icons";
import Button from "../../components/Button";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useSQLiteContext } from "expo-sqlite";
import { formatJsDateToDatabase, fullDate, fullHour } from "../../utils/parser";

import { Picker } from "@react-native-picker/picker";
import Task from "../../interfaces/Task";
import { router, useLocalSearchParams } from "expo-router";
import { colors } from "../../globalStyle/theme";
import globalStyle from "../../globalStyle";
import {
  spacing,
  borderRadius,
  shadows,
  typography,
} from "../../globalStyle/theme";
import useDatePicker from "./_useDatePicker";

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.neutral[900],
    paddingHorizontal: globalStyle.padding.horizontal,
    paddingTop: spacing.xl,
    paddingBottom: spacing["2xl"],
  },

  // Header section
  header: {
    marginBottom: spacing["3xl"],
  },
  headerTitle: {
    color: globalStyle.white,
    fontFamily: globalStyle.font.bold,
    fontSize: typography.fontSize["2xl"],
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    color: colors.neutral[400],
    fontFamily: globalStyle.font.regular,
    fontSize: typography.fontSize.md,
  },

  // Task picker section
  pickerSection: {
    marginBottom: spacing["3xl"],
  },
  pickerLabel: {
    color: globalStyle.white,
    fontFamily: globalStyle.font.medium,
    fontSize: typography.fontSize.md,
    marginBottom: spacing.md,
  },
  selectedTaskIndicator: {
    position: "absolute",
    right: spacing.md,
    top: spacing.md,
    backgroundColor: colors.success[500],
    borderRadius: borderRadius.full,
    width: 8,
    height: 8,
    zIndex: 1,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.neutral[600],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.neutral[800],
    ...shadows.sm,
    overflow: "hidden",
  },
  pickerContainerFocused: {
    borderColor: colors.primary[500],
    ...shadows.md,
  },
  picker: {
    color: colors.white,
    height: 56,
    paddingHorizontal: spacing.lg,
    backgroundColor: "transparent",
  },
  pickerItem: {
    backgroundColor: colors.neutral[800],
    color: globalStyle.white,
    fontSize: typography.fontSize.md,
    fontFamily: globalStyle.font.medium,
  },
  pickerItemSelected: {
    backgroundColor: colors.primary[600],
    color: globalStyle.white,
  },
  pickerDropdownIcon: {
    tintColor: colors.neutral[400],
    marginRight: spacing.md,
  },
  dateSection: {
    marginBottom: spacing["3xl"],
  },
  dateLabel: {
    color: globalStyle.white,
    fontFamily: globalStyle.font.medium,
    fontSize: typography.fontSize.md,
    marginBottom: spacing.md,
  },
  dateInputWapper: {
    borderWidth: 1,
    borderColor: colors.neutral[600],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.neutral[800],
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    ...shadows.sm,
  },
  date: {
    color: globalStyle.white,
    fontFamily: globalStyle.font.medium,
    fontSize: typography.fontSize.lg,
  },
  calendarButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[600],
    ...shadows.sm,
  },

  // Time section
  timeSection: {
    marginBottom: spacing["3xl"],
  },
  timeSectionTitle: {
    color: globalStyle.white,
    fontFamily: globalStyle.font.medium,
    fontSize: typography.fontSize.md,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  dateButtonsWrapper: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.lg,
  },
  dateWrapper: {
    flex: 1,
    alignItems: "center",
  },
  timeLabel: {
    color: globalStyle.white,
    fontFamily: globalStyle.font.medium,
    fontSize: typography.fontSize.md,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  timeInputContainer: {
    width: "100%",
    alignItems: "center",
  },

  // Button section
  buttonSection: {
    marginTop: "auto",
    paddingTop: spacing["2xl"],
  },

  // Form group styling
  formGroup: {
    marginBottom: spacing["2xl"],
  },
  formLabel: {
    color: globalStyle.white,
    fontFamily: globalStyle.font.medium,
    fontSize: typography.fontSize.md,
    marginBottom: spacing.md,
  },
});

/**
 * DateInput component displays a date with a calendar picker button
 * @param {Date} date - The date to display
 * @param {Function} onPress - Function to call when calendar button is pressed
 * @returns {JSX.Element} A date display with calendar picker button
 */
const DateInput = ({ date, onPress }: { date: Date; onPress: () => void }) => {
  return (
    <View style={styles.dateInputWapper}>
      <Text style={styles.date} testID="date-display">
        {fullDate(date.toISOString())}
      </Text>
      <TouchableOpacity onPress={() => onPress()} style={styles.calendarButton}>
        <Feather
          name="calendar"
          color="white"
          size={20}
          testID="calendar-icon"
        />
      </TouchableOpacity>
    </View>
  );
};

/**
 * TimeDisplay component displays time with a button
 * @param {Date} date - The date object containing time to display
 * @param {Function} onPress - Function to call when time button is pressed
 * @returns {JSX.Element} A time display with button
 */
const TimeDisplay = ({
  date,
  onPress,
  testID,
}: {
  date: Date;
  onPress: () => void;
  testID?: string;
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.dateInputWapper}
      testID={testID}
    >
      <Text style={styles.date}>{fullHour(date.toISOString())}</Text>
      <View style={styles.calendarButton}>
        <Feather name="clock" color="white" size={20} />
      </View>
    </TouchableOpacity>
  );
};

/**
 * AddRecord component allows users to add time records for tasks
 * @returns {JSX.Element} A form for adding time records with task selection, date picker, and time inputs
 */
const AddRecord = () => {
  const database = useSQLiteContext();
  const { projectID, taskID, taskName } = useLocalSearchParams();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<any>();

  const { date, showPicker, showDatePicker, handleUpdateDate } = useDatePicker(
    new Date()
  );

  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [project, setProject] = useState<IProject>();
  const [isPickerFocused, setIsPickerFocused] = useState(false);

  useEffect(() => {
    async function getProject() {
      let currentProjectID = projectID;

      // If we have a taskID but no projectID, get the project from the task
      if (taskID && !projectID) {
        const task = await database.getFirstAsync<Task>(
          `SELECT * FROM tasks WHERE task_id = ?;`,
          taskID as string
        );
        if (task) {
          currentProjectID = task.project_id.toString();
        }
      }

      if (currentProjectID) {
        const project = await database.getFirstAsync<IProject>(
          `SELECT * FROM projects WHERE project_id = ?;`,
          currentProjectID as string
        );
        setProject(project);
      }
    }

    getProject();
  }, [projectID, taskID]);

  useEffect(() => {
    async function getTasks() {
      const tasks = await database.getAllAsync<any>(
        "SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC;",
        project.project_id
      );

      setTasks(tasks);

      // If we have a taskID from navigation, prepopulate the selected task
      if (taskID) {
        setSelectedTask(parseInt(taskID as string));
      }
    }
    if (!project) return;
    getTasks();
  }, [project, taskID]);

  const getDifferenceInSeconds = () => {
    // Compare times based on the selected date (which we assume to be the same)
    const startSeconds =
      startTime.getHours() * 3600 + startTime.getMinutes() * 60;
    const endSeconds = endTime.getHours() * 3600 + endTime.getMinutes() * 60;

    // If end time is before start time, assume it's on the next day
    if (endSeconds < startSeconds) {
      return 24 * 3600 - startSeconds + endSeconds;
    }
    return endSeconds - startSeconds;
  };

  const formatCreatedAt = () => {
    const newDate = new Date(date);
    newDate.setHours(startTime.getHours());
    newDate.setMinutes(startTime.getMinutes());
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);

    return newDate;
  };

  const handleAddRecord = async () => {
    if (selectedTask === undefined || selectedTask === "none_task") return;

    await database.runAsync(
      "INSERT INTO timings (task_id, time, created_at) VALUES (?, ?, ?);",
      selectedTask,
      getDifferenceInSeconds(),
      formatJsDateToDatabase(formatCreatedAt())
    );

    router.back();
  };

  const handleTimeChange = (
    type: "start" | "end",
    event: any,
    selectedDate?: Date
  ) => {
    if (type === "start") {
      setShowStartPicker(false);
      if (selectedDate) setStartTime(selectedDate);
    } else {
      setShowEndPicker(false);
      if (selectedDate) setEndTime(selectedDate);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.neutral[900] }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Adicionar Registro</Text>
          <Text style={styles.headerSubtitle}>
            {project?.name
              ? `Projeto: ${project.name}`
              : "Carregando projeto..."}
            {taskName && ` • Tarefa: ${taskName}`}
          </Text>
        </View>

        <View style={styles.pickerSection}>
          <Text style={styles.pickerLabel}>Selecione uma tarefa</Text>
          <View
            style={[
              styles.pickerContainer,
              isPickerFocused && styles.pickerContainerFocused,
            ]}
          >
            {selectedTask && selectedTask !== "none_task" && (
              <View style={styles.selectedTaskIndicator} />
            )}
            <Picker
              selectedValue={selectedTask}
              onValueChange={(itemValue, itemIndex) =>
                setSelectedTask(itemValue)
              }
              style={styles.picker}
              dropdownIconColor={colors.neutral[400]}
              itemStyle={styles.pickerItem}
              onFocus={() => setIsPickerFocused(true)}
              onBlur={() => setIsPickerFocused(false)}
            >
              <Picker.Item
                label="Selecione a task"
                value="none_task"
                style={styles.pickerItem}
                color={colors.neutral[400]}
              />
              {tasks.map((task: Task) => (
                <Picker.Item
                  label={task.name}
                  value={task.task_id}
                  key={task.task_id}
                  style={styles.pickerItem}
                  color={colors.white}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.dateSection}>
          <Text style={styles.dateLabel}>Data do registro</Text>
          <DateInput date={date} onPress={showDatePicker} />
        </View>

        <View style={styles.timeSection}>
          <Text style={styles.timeSectionTitle}>Horário do trabalho</Text>
          <View style={styles.dateButtonsWrapper}>
            <View style={styles.dateWrapper}>
              <Text style={styles.timeLabel}>Início</Text>
              <TimeDisplay
                date={startTime}
                onPress={() => setShowStartPicker(true)}
                testID="start-time-display"
              />
            </View>
            <View style={styles.dateWrapper}>
              <Text style={styles.timeLabel}>Fim</Text>
              <TimeDisplay
                date={endTime}
                onPress={() => setShowEndPicker(true)}
                testID="end-time-display"
              />
            </View>
          </View>
        </View>

        <View style={styles.buttonSection}>
          <Button
            onPress={async () => await handleAddRecord()}
            text="Adicionar tempo"
          />
        </View>
      </ScrollView>

      {showPicker && (
        <DateTimePicker
          testID="timePicker"
          value={date || new Date()}
          mode={"date"}
          maximumDate={new Date()}
          onChange={handleUpdateDate}
        />
      )}
      {showStartPicker && (
        <DateTimePicker
          testID="startTimePicker"
          value={startTime}
          mode="time"
          is24Hour={true}
          onChange={(event, date) => handleTimeChange("start", event, date)}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          testID="endTimePicker"
          value={endTime}
          mode="time"
          is24Hour={true}
          onChange={(event, date) => handleTimeChange("end", event, date)}
        />
      )}
    </KeyboardAvoidingView>
  );
};

export default AddRecord;
