import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";

import { Project as IProject } from "../../interfaces/Project";
import { useEffect, useState } from "react";
import { Feather } from "@expo/vector-icons";
import Button from "../../components/Button";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useSQLiteContext } from "expo-sqlite";
import { formatJsDateToDatabase, fullDate } from "../../utils/parser";

import { Picker } from "@react-native-picker/picker";
import Task from "../../interfaces/Task";
import TextInput from "../../components/TextInput";
import { router, useLocalSearchParams } from "expo-router";
import { colors } from "../../globalStyle/theme";
import globalStyle from "../../globalStyle";
import { spacing, borderRadius, shadows, typography } from "../../globalStyle/theme";
import { useDatePicker } from "./useDatePicker";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[900],
    paddingHorizontal: globalStyle.padding.horizontal,
    paddingTop: spacing.xl,
    paddingBottom: spacing['2xl'],
  },

  // Header section
  header: {
    marginBottom: spacing['3xl'],
  },
  headerTitle: {
    color: globalStyle.white,
    fontFamily: globalStyle.font.bold,
    fontSize: typography.fontSize['2xl'],
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    color: colors.neutral[400],
    fontFamily: globalStyle.font.regular,
    fontSize: typography.fontSize.md,
  },

  // Task picker section
  pickerSection: {
    marginBottom: spacing['3xl'],
  },
  pickerLabel: {
    color: globalStyle.white,
    fontFamily: globalStyle.font.medium,
    fontSize: typography.fontSize.md,
    marginBottom: spacing.md,
  },
  selectedTaskIndicator: {
    position: 'absolute',
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
    overflow: 'hidden',
  },
  pickerContainerFocused: {
    borderColor: colors.primary[500],
    ...shadows.md,
  },
  picker: {
    color: colors.white,
    height: 56,
    paddingHorizontal: spacing.lg,
    backgroundColor: 'transparent',
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
    marginBottom: spacing['3xl'],
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
    marginBottom: spacing['3xl'],
  },
  timeSectionTitle: {
    color: globalStyle.white,
    fontFamily: globalStyle.font.medium,
    fontSize: typography.fontSize.md,
    marginBottom: spacing.md,
    textAlign: 'center',
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
    textAlign: 'center',
  },
  timeInputContainer: {
    width: '100%',
    alignItems: 'center',
  },

  // Button section
  buttonSection: {
    marginTop: 'auto',
    paddingTop: spacing['2xl'],
  },

  // Form group styling
  formGroup: {
    marginBottom: spacing['2xl'],
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
      <Text style={styles.date} testID="date-display">{fullDate(date.toISOString())}</Text>
      <TouchableOpacity onPress={() => onPress()} style={styles.calendarButton}>
        <Feather name="calendar" color="white" size={20} testID="calendar-icon" />
      </TouchableOpacity>
    </View>
  );
};

/**
 * TimeInput component displays and handles time input
 * @param {string} time - The time value in HHMM format
 * @param {Function} onChange - Function to call when time changes
 * @returns {JSX.Element} A time input field with formatted display
 */
const TimeInput = ({
  time,
  onChange,
  testID,
}: {
  time: string;
  onChange: (value: string) => void;
  testID?: string;
}) => {
  const formattedTime = `${time.slice(0, 2)}:${time.slice(2)}h`;
  return (
    <View style={styles.timeInputContainer}>
      <TextInput
        keyboardType="numeric"
        value={formattedTime}
        onChangeText={onChange}
        testID={testID}
      />
    </View>
  );
};

/**
 * AddRecord component allows users to add time records for tasks
 * @returns {JSX.Element} A form for adding time records with task selection, date picker, and time inputs
 */
const AddRecord = () => {
  const database = useSQLiteContext();
  const { projectID } = useLocalSearchParams();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<any>();

  const { date, showPicker, showDatePicker, handleUpdateDate } = useDatePicker(new Date());

  const [startTime, setStartTime] = useState("0000");
  const [endTime, setEndTime] = useState("0000");

  const [project, setProject] = useState<IProject>();
  const [isPickerFocused, setIsPickerFocused] = useState(false);

  useEffect(() => {
    async function getProject() {
      const project = await database.getFirstAsync<IProject>(
        `SELECT * FROM projects WHERE project_id = ?;`,
        projectID as string
      );
      setProject(project);
    }

    getProject();
  }, [projectID]);

  useEffect(() => {
    async function getTasks() {
      const tasks = await database.getAllAsync<any>(
        "SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC;",
        project.project_id
      );

      setTasks(tasks);
    }
    if (!project) return;
    getTasks();
  }, [project]);

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

    router.back();
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Adicionar Registro</Text>
        <Text style={styles.headerSubtitle}>
          {project?.name ? `Projeto: ${project.name}` : 'Carregando projeto...'}
        </Text>
      </View>

      <View style={styles.pickerSection}>
        <Text style={styles.pickerLabel}>Selecione uma tarefa</Text>
        <View style={[
          styles.pickerContainer,
          isPickerFocused && styles.pickerContainerFocused
        ]}>
          {selectedTask && selectedTask !== "none_task" && (
            <View style={styles.selectedTaskIndicator} />
          )}
          <Picker
            selectedValue={selectedTask}
            onValueChange={(itemValue, itemIndex) => setSelectedTask(itemValue)}
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
            <View testID="start-time-display">
              <TimeInput
                onChange={(value) => handleChangeTime("start", value)}
                time={startTime}
                testID="start-time-input"
              />
            </View>
          </View>
          <View style={styles.dateWrapper}>
            <Text style={styles.timeLabel}>Fim</Text>
            <View testID="end-time-display">
              <TimeInput
                onChange={(value) => handleChangeTime("end", value)}
                time={endTime}
                testID="end-time-input"
              />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.buttonSection}>
        <Button
          onPress={async () => await handleAddRecord()}
          text="Adicionar tempo"
        />
      </View>

      {showPicker && (
        <DateTimePicker
          testID="timePicker"
          value={date || new Date()}
          mode={"date"}
          maximumDate={new Date()}
          onChange={handleUpdateDate}
        />
      )}
    </View>
  );
};

export default AddRecord;
