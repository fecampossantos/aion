import {
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";

import Button from "../../components/Button";
import { Feather } from "@expo/vector-icons";

import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect } from "react";

import { fullDate } from "../../utils/parser";
import globalStyle from "../../globalStyle";

import { BarChart } from "react-native-chart-kit";
import { useLocalSearchParams, router } from "expo-router";

import useReport from "./useReport";
import { useReportGeneration } from "./useReportGeneration";

import { useSQLiteContext } from "expo-sqlite";
import { theme } from "../../globalStyle/theme";

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.neutral[900],
    flex: 1,
    paddingHorizontal: globalStyle.padding.horizontal,
  },
  header: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 24,
    gap: 16,
  },
  title: {
    color: globalStyle.white,
    fontSize: 28,
    fontFamily: globalStyle.font.bold,
    textAlign: "center",
  },
  subtitle: {
    color: globalStyle.white,
    fontSize: 16,
    fontFamily: globalStyle.font.regular,
    textAlign: "center",
    opacity: 0.8,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  projectStatsCard: {
    backgroundColor: globalStyle.black.light,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: globalStyle.black.main,
  },
  projectStatsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  projectStatsTitle: {
    color: globalStyle.white,
    fontSize: 18,
    fontFamily: globalStyle.font.medium,
  },
  projectStatsContent: {
    gap: 16,
  },
  projectStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 12,
  },
  projectStatIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: globalStyle.black.main,
    alignItems: "center",
    justifyContent: "center",
  },
  projectStatText: {
    flex: 1,
  },
  projectStatLabel: {
    color: globalStyle.white,
    fontSize: 14,
    fontFamily: globalStyle.font.regular,
    opacity: 0.8,
    marginBottom: 4,
  },
  projectStatValue: {
    color: globalStyle.white,
    fontSize: 18,
    fontFamily: globalStyle.font.medium,
  },
  dateSection: {
    marginBottom: 32,
    gap: 20,
  },
  sectionTitle: {
    color: globalStyle.white,
    fontSize: 18,
    fontFamily: globalStyle.font.medium,
    marginBottom: 8,
  },
  dateInputsContainer: {
    gap: 20,
  },
  dateInputContainer: {
    gap: 8,
  },
  dateLabel: {
    color: globalStyle.white,
    fontSize: 14,
    fontFamily: globalStyle.font.medium,
    opacity: 0.9,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: globalStyle.black.light,
    borderRadius: 12,
    padding: 16,
    backgroundColor: globalStyle.black.main,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 56,
  },
  dateInputActive: {
    borderColor: globalStyle.white,
    borderWidth: 2,
    backgroundColor: globalStyle.black.light,
  },
  dateContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dateText: {
    color: globalStyle.white,
    fontSize: 16,
    fontFamily: globalStyle.font.medium,
  },
  chevronIcon: {
    opacity: 0.7,
  },
  chartSection: {
    marginBottom: 32,
    padding: 20,
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  chartTitle: {
    color: globalStyle.white,
    fontSize: 18,
    fontFamily: globalStyle.font.medium,
  },
  chartContainer: {
    alignItems: "center",
  },
  chart: {
    borderRadius: 12,
  },
  actionSection: {
    alignItems: "center",
    gap: 20,
    marginBottom: 32,
  },
  generateReportButton: {
    minWidth: 200,
    height: 56,
    borderRadius: 16,
  },
  loadingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: globalStyle.black.light,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: globalStyle.black.main,
  },
  loadingText: {
    color: globalStyle.white,
    fontSize: 14,
    fontFamily: globalStyle.font.regular,
    opacity: 0.8,
  },
  dangerZone: {
    borderTopColor: globalStyle.white,
    borderTopWidth: 1,
    paddingVertical: 20,
    marginTop: 20,
    gap: 16,
  },
  dangerZoneTitle: {
    color: globalStyle.white,
    fontSize: 18,
    fontFamily: globalStyle.font.medium,
    textAlign: "center",
    marginBottom: 8,
  },
  dangerZoneButtons: {
    gap: 12,
  },
  editButton: {
    backgroundColor: globalStyle.black.light,
    height: 48,
    borderRadius: 12,
  },
  deleteButton: {
    backgroundColor: "#dc2626",
    height: 48,
    borderRadius: 12,
  },
});

export const chartConfig = {
  backgroundGradientFrom: theme.colors.neutral[900],
  backgroundGradientTo: theme.colors.neutral[900],
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  barPercentage: 0.5,
};

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
      <View
        style={[
          styles.projectStatItem,
          { borderBottomWidth: 1, borderBottomColor: globalStyle.black.main },
        ]}
      >
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

  const { isGeneratingReport, handleGenerateReport } = useReportGeneration();

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
   * Generates and shares the PDF report
   */
  const onGenerateReport = async () => {
    const getTimingsData = async () => {
      return await database.getAllAsync<{
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
        [
          projectID,
          startDate.toISOString().slice(0, 19).replace("T", " "),
          endDate.toISOString().slice(0, 19).replace("T", " "),
        ]
      );
    };

    await handleGenerateReport({
      project,
      projectID,
      startDate,
      endDate,
      getTimings: getTimingsData,
    });
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
            <Text style={styles.chartTitle}>Atividade por dia</Text>
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
          onPress={onGenerateReport}
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
