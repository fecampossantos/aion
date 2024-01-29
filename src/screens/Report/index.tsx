import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  fullDate,
  secondsToHHMMSS,
  secondsToTimeHHMMSS,
} from "../../../utils/parser";
import { Project as IProject } from "../../../interfaces/Project";
import styles from "./styles";
import { useState } from "react";
import { useSQLiteContext } from "expo-sqlite/next";
import globalStyle from "../../globalStyle";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";
import Button from "../../components/Button";

import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import { shareAsync } from "expo-sharing";
import { generateReportHTML } from "../../../utils/pdfReportService";

const DateInput = ({ date, onPress }: { date: Date; onPress: () => void }) => (
  <View style={styles.dateInputWapper}>
    <Text style={styles.date}>{fullDate(date.toISOString())}</Text>
    <TouchableOpacity onPress={() => onPress()}>
      <Feather name="calendar" color="white" size={20} />
    </TouchableOpacity>
  </View>
);

type TimingsResult = {
  task_completed: 0 | 1;
  timing_created_at: string;
  task_name: string;
  timing_timed: number;
};

const Report = ({ route, navigation }) => {
  const database = useSQLiteContext();
  const project: IProject = route.params.project;
  const [startDate, setStartDate] = useState(() => {
    const currentDate = new Date();
    const sevenDaysAgo = new Date(currentDate);
    sevenDaysAgo.setDate(currentDate.getDate() - 7);

    return sevenDaysAgo;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerValue, setDatePickerValue] = useState(null);
  const [dateShown, setDateShown] = useState<"start" | "end" | null>(null);

  useFocusEffect(() => {
    navigation.setOptions({
      title: `Novo report - ${project.name}`,
    });
  });

  const handleShowDatePicker = (dateValue: "start" | "end") => {
    setDateShown(dateValue);
    setDatePickerValue(dateValue === "start" ? startDate : endDate);
    setShowDatePicker(true);
  };

  const handleUpdateDate = (event, selectedDate) => {
    if (event.type !== "set") return;
    if (dateShown === "start") {
      setStartDate(new Date(selectedDate));
    } else {
      setEndDate(new Date(selectedDate));
    }
    setShowDatePicker(false);
  };

  const handleGenerateReport = async () => {
    try {
      const timings = await database.getAllAsync<TimingsResult>(
        `
            SELECT
            tk.completed as task_completed,
            tk.name as task_name,
            ti.created_at as timing_created_at,
            ti.time as timing_timed
            FROM tasks tk
            LEFT JOIN
            timings ti ON tk.task_id = ti.task_id
            WHERE
            tk.project_id = ? AND ti.created_at BETWEEN ? AND ?
            ORDER BY
            ti.created_at;
            `,
        [project.project_id, getInitOfDay(startDate), getEndOfDay(endDate)]
      );

      const startDateSTR = fullDate(startDate.toString());
      const endDateSTR = fullDate(endDate.toString());

      const documentName = `Report_${project.name}_${startDateSTR.replaceAll(
        "/",
        "-"
      )}_${endDateSTR.replaceAll("/", "-")}`;

      const html = generateReportHTML(
        project,
        startDateSTR,
        endDateSTR,
        timings,
        documentName
      );

      const { uri } = await Print.printToFileAsync({ html });

      const pdfFile = `${uri.slice(
        0,
        uri.lastIndexOf("/") + 1
      )}${documentName}.pdf`;

      await FileSystem.moveAsync({
        from: uri,
        to: pdfFile,
      });

      await shareAsync(pdfFile, { UTI: ".pdf", mimeType: "application/pdf" });
    } catch (e) {
      console.warn(e);
    }
  };

  const getInitOfDay = (day: Date) => {
    const startOfDay = new Date(day);
    startOfDay.setHours(0, 0, 0, 0);

    return startOfDay.toISOString().slice(0, 19).replace("T", " ");
  };

  const getEndOfDay = (day: Date) => {
    const endOfDay = new Date(day);
    endOfDay.setHours(23, 59, 59, 999);

    return endOfDay.toISOString().slice(0, 19).replace("T", " ");
  };

  return (
    <View style={styles.container}>
      <View style={styles.dateButtonsWrapper}>
        <View style={styles.dateWrapper}>
          <Text style={{ color: globalStyle.white }}>De</Text>
          <DateInput
            date={startDate}
            onPress={() => handleShowDatePicker("start")}
          />
        </View>
        <View style={styles.dateWrapper}>
          <Text style={{ color: globalStyle.white }}>Até</Text>
          <DateInput
            date={endDate}
            onPress={() => handleShowDatePicker("end")}
          />
        </View>
      </View>
      <Button onPress={handleGenerateReport} text="Gerar report" />
      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={datePickerValue || new Date()}
          mode={"date"}
          is24Hour={true}
          onChange={(event, selectedDate) =>
            handleUpdateDate(event, selectedDate)
          }
          minimumDate={dateShown === "end" ? startDate : null}
          maximumDate={new Date()}
        />
      )}
    </View>
  );
};

export default Report;
