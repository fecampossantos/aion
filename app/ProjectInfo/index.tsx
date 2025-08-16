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

const DateInput = ({ date, onPress }: { date: Date; onPress: () => void }) => (
  <View style={styles.dateInputWapper}>
    <Text style={styles.date}>{fullDate(date.toISOString())}</Text>
    <TouchableOpacity onPress={() => onPress()}>
      <Feather name="calendar" color="white" size={20} />
    </TouchableOpacity>
  </View>
);

// const GenerateReportButton = ({ onPress }: { onPress: () => void }) => (
//   <TouchableOpacity onPress={onPress}>
//     <Feather name="file-text" size={20} color="white" />
//   </TouchableOpacity>
// );

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

      const documentName = `Relatorio_${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_${startDateSTR.replaceAll(
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
      setIsGeneratingReport(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.projectInfoWrapper}>
        <Text
          style={{
            color: globalStyle.white,
            fontFamily: globalStyle.font.regular,
          }}
        >
          Custo / hora: R${project.hourly_cost.toFixed(2)}
        </Text>
        <Text
          style={{
            color: globalStyle.white,
            fontFamily: globalStyle.font.regular,
          }}
        >
          Criado em: {fullDate(project.created_at.toString())}
        </Text>
      </View>

      <View style={styles.datesWrapper}>
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
            <DateInput
              date={startDate}
              onPress={() => handleShowDatePicker("start")}
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
            <DateInput
              date={endDate}
              onPress={() => handleShowDatePicker("end")}
            />
          </View>
        </View>
      </View>

      {showChart ? (
        <BarChart
          data={resultSet}
          width={Dimensions.get("screen").width - 48}
          height={Dimensions.get("screen").height * 0.5}
          yAxisLabel=""
          yAxisSuffix="min"
          chartConfig={chartConfig}
          verticalLabelRotation={30}
          fromZero={true}
        />
      ) : null}

      {/* Generate Report Button */}
      <View style={{ marginVertical: 20 }}>
        <Button
          buttonStyle={{ 
            backgroundColor: globalStyle.primary || '#2563eb',
            opacity: isGeneratingReport ? 0.7 : 1
          }}
          onPress={handleGenerateReport}
          text={isGeneratingReport ? "Gerando relatório..." : "📄 Gerar Relatório PDF"}
        />
      </View>

      <View style={styles.dangerZone}>
        <Button
          buttonStyle={{ backgroundColor: globalStyle.black.light }}
          onPress={() =>
            router.push({
              pathname: "/EditProject",
              params: { projectID: project.project_id },
            })
          }
          text="Editar projeto"
        />
        <Button
          buttonStyle={{ backgroundColor: "red" }}
          onPress={() => handleClickedOnDeleteProject()}
          text="Apagar projeto"
        />
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
