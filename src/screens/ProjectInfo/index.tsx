import { Project as IProject } from "../../../interfaces/Project";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";

import styles from "./styles";
import Button from "../../components/Button";
import { Feather } from "@expo/vector-icons";

import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";

import { fullDate } from "../../../utils/parser";
import globalStyle from "../../globalStyle";

import { BarChart } from "react-native-chart-kit";
import { useSQLiteContext } from "expo-sqlite/next";

const DateInput = ({ date, onPress }: { date: Date; onPress: () => void }) => (
  <View style={styles.dateInputWapper}>
    <Text style={styles.date}>{fullDate(date.toISOString())}</Text>
    <TouchableOpacity onPress={() => onPress()}>
      <Feather name="calendar" color="white" size={20} />
    </TouchableOpacity>
  </View>
);

const ProjectInfo = ({ route, navigation }) => {
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
    const labels: Array<string> = result.map((r) => r.day);
    const data: Array<number> = result.map((r) => r.total_time);

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
    navigation.navigate("Home");
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
    backgroundGradientFrom: "#1E2923",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#08130D",
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false, // optional
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.datesWrapper}>
          <View style={styles.dateButtonsWrapper}>
            <View style={styles.dateWrapper}>
              <Text style={{ color: globalStyle.white }}>
                De {showChart ? "s" : "n"}
              </Text>
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
        </View>

        {showChart ? (
          <BarChart
            // style={graphStyle}
            data={resultSet}
            width={Dimensions.get("screen").width - 48}
            height={220}
            yAxisLabel=""
            yAxisSuffix="s"
            chartConfig={chartConfig}
            verticalLabelRotation={30}
            fromZero={true}
          />
        ) : null}
        <View>
          <Text style={{ color: globalStyle.black.light }}>
            Informações do projeto
          </Text>
          <Text style={{ color: globalStyle.black.light }}>
            {JSON.stringify(project)}
          </Text>
        </View>

        <Button
          buttonStyle={{ backgroundColor: "red" }}
          onPress={() => handleDeleteProject()}
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
    </>
  );
};

export default ProjectInfo;
