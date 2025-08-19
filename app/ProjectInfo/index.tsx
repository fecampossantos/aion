import {
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";

import styles, { chartConfig } from "./styles";
import Button from "../../components/Button";
import { Feather } from "@expo/vector-icons";

import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";

import { fullDate } from "../../utils/parser";
import globalStyle from "../../globalStyle";

import { BarChart } from "react-native-chart-kit";
import { useLocalSearchParams, router } from "expo-router";

import useReport from "./useReport";

import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import { shareAsync } from "expo-sharing";
import { generateReportHTML } from "../../utils/pdfReportService";
import { useSQLiteContext } from "expo-sqlite";

/**
 * DateInput component displays a formatted date with a calendar icon
 * @param {Date} date - The date to display
 * @param {Function} onPress - Function to call when calendar icon is pressed
 * @param {string} label - Label text for the date input
 * @param {boolean} isActive - Whether this date input is currently active
 * @returns {JSX.Element} A date display with calendar icon
 */
const DateInput = ({
  date,
  onPress,
  label,
  isActive,
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
 * Project stats card component showing key project information
 * @param {Object} project - The project object containing project details
 * @returns {JSX.Element} A card displaying project statistics
 */
const ProjectStatsCard = ({ project }: { project: any }) => (
  <View style={styles.projectStatsCard}>
    <View style={styles.projectStatsHeader}>
      <Feather name="info" color={globalStyle.white} size={24} />
      <Text style={styles.projectStatsTitle}>Informações do Projeto</Text>
    </View>
    <View style={styles.projectStatsContent}>
      <View style={styles.projectStatItem}>
        <View style={styles.projectStatIcon}>
          <Feather name="dollar-sign" color={globalStyle.white} size={16} />
        </View>
        <View style={styles.projectStatText}>
          <Text style={styles.projectStatLabel}>Custo por Hora</Text>
          <Text style={styles.projectStatValue}>
            R$ {project.hourly_cost.toFixed(2)}
          </Text>
        </View>
      </View>
      <View style={styles.projectStatItem}>
        <View style={styles.projectStatIcon}>
          <Feather name="calendar" color={globalStyle.white} size={16} />
        </View>
        <View style={styles.projectStatText}>
          <Text style={styles.projectStatLabel}>Criado em</Text>
          <Text style={styles.projectStatValue}>
            {fullDate(project.created_at.toString())}
          </Text>
        </View>
      </View>
    </View>
  </View>
);

/**
 * ProjectInfo component displays detailed project information with charts and date filtering
 * @returns {JSX.Element} A scrollable view with project details, charts, and action buttons
 */
const ProjectInfo = () => {
  const { projectID } = useLocalSearchParams<{ projectID: string }>();
  const database = useSQLiteContext();
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const {
    getTimings,
    getProject,
    endDate,
    handleShowDatePicker,
    startDate,
    handleClickedOnDeleteProject,
    resultSet,
    showDatePicker,
    datePickerValue,
    handleUpdateDate,
    dateShown,
    project,
    showChart,
  } = useReport(projectID);

  useEffect(() => {
    getProject();
  }, [projectID]);

  useEffect(() => {
    async function render() {
      await getTimings();
    }
    if (!project) return;
    render();
  }, [endDate, project]);

  if (!project) return null;

  /**
   * Gets the start of day as ISO string for database queries
   * @param {Date} day - The date to get start of day for
   * @returns {string} ISO string formatted for database
   */
  const getInitOfDay = (day: Date) => {
    const startOfDay = new Date(day);
    startOfDay.setHours(0, 0, 0, 0);
    return startOfDay.toISOString().slice(0, 19).replace("T", " ");
  };

  /**
   * Gets the end of day as ISO string for database queries
   * @param {Date} day - The date to get end of day for
   * @returns {string} ISO string formatted for database
   */
  const getEndOfDay = (day: Date) => {
    const endOfDay = new Date(day);
    endOfDay.setHours(23, 59, 59, 999);
    return endOfDay.toISOString().slice(0, 19).replace("T", " ");
  };

  /**
   * Generates and shares the PDF report
   */
  const handleGenerateReport = async () => {
    if (isGeneratingReport || !project) return;

    setIsGeneratingReport(true);
    try {
      // Get comprehensive timing data with task information
      const timings = await database.getAllAsync<{
        task_completed: 0 | 1;
        timing_created_at: string;
        task_name: string;
        timing_timed: number;
        task_created_at?: string;
      }>(
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
        [projectID, getInitOfDay(startDate), getEndOfDay(endDate)]
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

      const documentName = `Relatorio_${project.name.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}_${startDateSTR.replaceAll("/", "-")}_${endDateSTR.replaceAll(
        "/",
        "-"
      )}`;

      const html = generateReportHTML(
        project,
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
        },
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
      setIsGeneratingReport(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Feather name="folder" color={globalStyle.white} size={32} />
        <Text style={styles.title}>{project.name}</Text>
        <Text style={styles.subtitle}>
          Visualize estatísticas e gere relatórios do seu projeto
        </Text>
      </View>

      <ProjectStatsCard project={project} />

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

      {showChart && (
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Feather name="bar-chart-2" color={globalStyle.white} size={24} />
            <Text style={styles.chartTitle}>Atividade por Tarefa</Text>
          </View>
          <View style={styles.chartContainer}>
            <BarChart
              data={resultSet}
              width={Dimensions.get("screen").width - 48}
              height={Dimensions.get("screen").height * 0.4}
              yAxisLabel=""
              yAxisSuffix="min"
              chartConfig={chartConfig}
              verticalLabelRotation={30}
              fromZero={true}
              style={styles.chart}
            />
          </View>
        </View>
      )}

      <View style={styles.actionSection}>
        <Button
          buttonStyle={styles.generateReportButton}
          onPress={handleGenerateReport}
          text={
            isGeneratingReport
              ? "Gerando relatório..."
              : "📄 Gerar Relatório PDF"
          }
          textStyle={{
            fontSize: 12,
            textAlign: "center",
            fontFamily: globalStyle.font.regular,
            color: globalStyle.white,
          }}
        />
        {isGeneratingReport && (
          <View style={styles.loadingInfo}>
            <Feather name="loader" color={globalStyle.white} size={16} />
            <Text style={styles.loadingText}>
              Processando dados e gerando PDF...
            </Text>
          </View>
        )}
      </View>

      <View style={styles.dangerZone}>
        <Text style={styles.dangerZoneTitle}>Gerenciar Projeto</Text>
        <View style={styles.dangerZoneButtons}>
          <Button
            buttonStyle={styles.editButton}
            onPress={() =>
              router.push({
                pathname: "/EditProject",
                params: { projectID: project.project_id },
              })
            }
            text="✏️ Editar Projeto"
          />
          <Button
            buttonStyle={styles.deleteButton}
            onPress={() => handleClickedOnDeleteProject()}
            text="🗑️ Apagar Projeto"
          />
        </View>
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

export default ProjectInfo;
