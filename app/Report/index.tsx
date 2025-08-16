import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { fullDate } from "../../utils/parser";
import styles from "./styles";
import { useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import globalStyle from "../../globalStyle";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams } from "expo-router";
import Button from "../../components/Button";

import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import { shareAsync } from "expo-sharing";
import { generateReportHTML } from "../../utils/pdfReportService";
import { Project } from "../../interfaces/Project";

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
  task_created_at?: string;
};

const Report = () => {
  const database = useSQLiteContext();
  const { project } = useLocalSearchParams();
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
  const [isGenerating, setIsGenerating] = useState(false);

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
    if (isGenerating) return;
    
    setIsGenerating(true);
    try {
      // Get project details
      const projectData = await database.getFirstAsync<Project>(
        `SELECT * FROM projects WHERE project_id = ?;`,
        [typeof project === 'string' ? project : project?.project_id]
      );

      if (!projectData) {
        Alert.alert("Erro", "Projeto não encontrado. Verifique se o projeto ainda existe.");
        return;
      }

      // Get comprehensive timing data with task information
      const timings = await database.getAllAsync<TimingsResult>(
        `
        SELECT
          tk.completed as task_completed,
          tk.name as task_name,
          tk.created_at as task_created_at,
          ti.created_at as timing_created_at,
          ti.time as timing_timed
        FROM tasks tk
        LEFT JOIN timings ti ON tk.task_id = ti.task_id
        WHERE
          tk.project_id = ? 
          AND ti.created_at BETWEEN ? AND ?
          AND ti.time > 0
        ORDER BY
          ti.created_at DESC;
        `,
        [
          typeof project === 'string' ? project : project?.project_id,
          getInitOfDay(startDate), 
          getEndOfDay(endDate)
        ]
      );

      if (timings.length === 0) {
        Alert.alert(
          "Nenhum dado encontrado", 
          "Não foram encontradas sessões de trabalho no período selecionado. Verifique as datas ou adicione algumas sessões de trabalho."
        );
        return;
      }

      const startDateSTR = fullDate(startDate.toString());
      const endDateSTR = fullDate(endDate.toString());

      const documentName = `Relatorio_${projectData.name.replace(/[^a-zA-Z0-9]/g, '_')}_${startDateSTR.replaceAll(
        "/",
        "-"
      )}_${endDateSTR.replaceAll("/", "-")}`;

      const html = generateReportHTML(
        projectData,
        startDateSTR,
        endDateSTR,
        timings,
        documentName
      );

      const { uri } = await Print.printToFileAsync({ 
        html,
        margins: {
          left: 20,
          top: 20,
          right: 20,
          bottom: 20,
        }
      });

      const pdfFile = `${uri.slice(
        0,
        uri.lastIndexOf("/") + 1
      )}${documentName}.pdf`;

      await FileSystem.moveAsync({
        from: uri,
        to: pdfFile,
      });

      await shareAsync(pdfFile, { UTI: ".pdf", mimeType: "application/pdf" });
      
      Alert.alert("Sucesso", "Relatório PDF gerado com sucesso!");
    } catch (e) {
      console.warn("Error generating report:", e);
      Alert.alert(
        "Erro ao gerar relatório", 
        "Ocorreu um erro ao gerar o relatório PDF. Tente novamente ou verifique se há espaço suficiente no dispositivo."
      );
    } finally {
      setIsGenerating(false);
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
      
      <Button 
        onPress={handleGenerateReport} 
        text={isGenerating ? "Gerando relatório..." : "Gerar relatório"}
        buttonStyle={{ 
          opacity: isGenerating ? 0.7 : 1,
          backgroundColor: isGenerating ? globalStyle.black.light : undefined 
        }}
      />
      
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
