import { Project as IProject } from "../../interfaces/Project";
import {
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";

import styles from "./styles";
import Button from "../../components/Button";
import { Feather } from "@expo/vector-icons";

import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";

import { fullDate } from "../../utils/parser";
import globalStyle from "../../globalStyle";

import { BarChart } from "react-native-chart-kit";
import { useSQLiteContext } from "expo-sqlite";
import { useLocalSearchParams, router } from "expo-router";

const DateInput = ({ date, onPress }: { date: Date; onPress: () => void }) => (
  <View style={styles.dateInputWapper}>
    <Text style={styles.date}>{fullDate(date.toISOString())}</Text>
    <TouchableOpacity onPress={() => onPress()}>
      <Feather name="calendar" color="white" size={20} />
    </TouchableOpacity>
  </View>
);

const GenerateReportButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity onPress={onPress}>
    <Feather name="file-text" size={20} color="white" />
  </TouchableOpacity>
);

const ProjectInfo = () => {
  const database = useSQLiteContext();
  const { project } = useLocalSearchParams<{ project: IProject }>();
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
  const [resultSet, setResultSet] = useState<{
    labels: Array<string>;
    datasets: Array<{ data: Array<number> }>;
  } | null>();

  const [showChart, setShowChart] = useState(false);

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

  const prepareResultSet = (
    result: Array<{ day: string; total_time: number }>
  ) => {
    const labels: Array<string> = result.map((r) => {
      const [year, month, day] = r.day.split("-");
      return `${day}/${month}/${year}`;
    });
    const data: Array<number> = result.map((r) => {
      return r.total_time / 60;
    });

    return { labels, datasets: [{ data }] };
  };

  async function get() {
    const query = `SELECT 
        DATE(t.created_at) AS day,
        SUM(t.time) AS total_time
    FROM 
        timings t
    JOIN 
        tasks tk ON t.task_id = tk.task_id
    WHERE 
        tk.project_id = ?
        AND t.created_at BETWEEN ? AND ?
    GROUP BY 
        day
    ORDER BY 
        day;`;

    try {
      const result = await database.getAllAsync<{
        day: string;
        total_time: number;
      }>(
        query,
        project.project_id,
        getInitOfDay(startDate),
        getEndOfDay(endDate)
      );
      setResultSet(prepareResultSet(result));
      setShowChart(true);
    } catch (e) {
      console.log("error", e);
    }
  }

  useEffect(() => {
    async function render() {
      await get();
    }

    render();
  }, [endDate]);

  const handleDeleteProject = () => {
    database.runAsync(
      "DELETE FROM projects WHERE project_id = ?;",
      project.project_id
    );
    router.push("/");
  };

  const handleClickedOnDeleteProject = () => {
    Alert.alert("Apagar projeto?", "Você perderá todas as informações dele!", [
      { text: "Cancelar", style: "cancel", onPress: () => {} },
      {
        text: "Apagar",
        style: "destructive",
        onPress: () => handleDeleteProject(),
      },
    ]);
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

  const handleShowDatePicker = (dateValue: "start" | "end") => {
    setDateShown(dateValue);
    setDatePickerValue(dateValue === "start" ? startDate : endDate);
    setShowDatePicker(true);
  };

  const chartConfig = {
    backgroundGradientFrom: globalStyle.background,
    backgroundGradientTo: globalStyle.background,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    barPercentage: 0.5,
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.projectInfoWrapper}>
        <Text
          style={{
            color: globalStyle.white,
            fontSize: 20,
            fontFamily: globalStyle.font.bold,
          }}
        >
          Informações do projeto
        </Text>
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

      <View style={styles.dangerZone}>
        <Button
          buttonStyle={{ backgroundColor: globalStyle.black.light }}
          onPress={() =>
            router.push({ pathname: "/EditProject", params: { project } })
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
