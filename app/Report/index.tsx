import { View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
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

/**
 * Date input component with modern styling and calendar icon
 * @param date - The date to display
 * @param onPress - Function to call when the input is pressed
 * @param label - Label text for the date input
 * @param isActive - Whether this date input is currently active
 */
const DateInput = ({ 
  date, 
  onPress, 
  label, 
  isActive 
}: { 
  date: Date; 
  onPress: () => void; 
  label: string;
  isActive: boolean;
}) => (
  <View style={styles.dateInputContainer}>
    <Text style={styles.dateLabel}>{label}</Text>
    <TouchableOpacity 
      style={[styles.dateInput, isActive && styles.dateInputActive]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.dateContent}>
        <Feather name="calendar" color={globalStyle.white} size={20} />
        <Text style={styles.dateText}>{fullDate(date.toISOString())}</Text>
      </View>
      <Feather 
        name="chevron-down" 
        color={globalStyle.white} 
        size={16} 
        style={styles.chevronIcon}
      />
    </TouchableOpacity>
  </View>
);

/**
 * Summary card component showing date range information
 * @param startDate - Start date of the report period
 * @param endDate - End date of the report period
 */
const SummaryCard = ({ startDate, endDate }: { startDate: Date; endDate: Date }) => {
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <Feather name="bar-chart-2" color={globalStyle.white} size={24} />
        <Text style={styles.summaryTitle}>Período do Relatório</Text>
      </View>
      <View style={styles.summaryContent}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Duração</Text>
          <Text style={styles.summaryValue}>{daysDiff} {daysDiff === 1 ? 'dia' : 'dias'}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>De</Text>
          <Text style={styles.summaryValue}>{fullDate(startDate.toISOString())}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Até</Text>
          <Text style={styles.summaryValue}>{fullDate(endDate.toISOString())}</Text>
        </View>
      </View>
    </View>
  );
};

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

  /**
   * Shows the date picker for the specified date type
   * @param dateValue - Which date to edit ("start" or "end")
   */
  const handleShowDatePicker = (dateValue: "start" | "end") => {
    setDateShown(dateValue);
    setDatePickerValue(dateValue === "start" ? startDate : endDate);
    setShowDatePicker(true);
  };

  /**
   * Handles date updates from the date picker
   * @param event - Date picker event
   * @param selectedDate - The selected date
   */
  const handleUpdateDate = (event, selectedDate) => {
    if (event.type !== "set") return;
    if (dateShown === "start") {
      setStartDate(new Date(selectedDate));
    } else {
      setEndDate(new Date(selectedDate));
    }
    setShowDatePicker(false);
  };

  /**
   * Generates and shares the PDF report
   */
  const handleGenerateReport = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    try {
      // Get project details
      const projectData = await database.getFirstAsync<Project>(
        `SELECT * FROM projects WHERE project_id = ?;`,
        [typeof project === 'string' ? project : (project as any)?.project_id]
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
          typeof project === 'string' ? project : (project as any)?.project_id,
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

  /**
   * Gets the start of day as ISO string for database queries
   * @param day - The date to get start of day for
   * @returns ISO string formatted for database
   */
  const getInitOfDay = (day: Date) => {
    const startOfDay = new Date(day);
    startOfDay.setHours(0, 0, 0, 0);

    return startOfDay.toISOString().slice(0, 19).replace("T", " ");
  };

  /**
   * Gets the end of day as ISO string for database queries
   * @param day - The date to get end of day for
   * @returns ISO string formatted for database
   */
  const getEndOfDay = (day: Date) => {
    const endOfDay = new Date(day);
    endOfDay.setHours(23, 59, 59, 999);

    return endOfDay.toISOString().slice(0, 19).replace("T", " ");
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Feather name="file-text" color={globalStyle.white} size={32} />
        <Text style={styles.title}>Gerar Relatório</Text>
        <Text style={styles.subtitle}>
          Selecione o período para gerar um relatório detalhado das suas atividades
        </Text>
      </View>

      <View style={styles.dateSection}>
        <Text style={styles.sectionTitle}>Período de Análise</Text>
        <View style={styles.dateInputsContainer}>
          <DateInput
            date={startDate}
            onPress={() => handleShowDatePicker("start")}
            label="Data Inicial"
            isActive={dateShown === "start"}
          />
          <DateInput
            date={endDate}
            onPress={() => handleShowDatePicker("end")}
            label="Data Final"
            isActive={dateShown === "end"}
          />
        </View>
      </View>

      <SummaryCard startDate={startDate} endDate={endDate} />
      
      <View style={styles.actionSection}>
        <Button 
          onPress={handleGenerateReport} 
          text={isGenerating ? "Gerando relatório..." : "Gerar Relatório PDF"}
          buttonStyle={styles.generateButton}
        />
        {isGenerating && (
          <View style={styles.loadingInfo}>
            <Feather name="loader" color={globalStyle.white} size={16} />
            <Text style={styles.loadingText}>Processando dados e gerando PDF...</Text>
          </View>
        )}
      </View>
      
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
    </ScrollView>
  );
};

export default Report;
