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
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerValue, setDatePickerValue] = useState(null);
  const [dateShown, setDateShown] = useState<"start" | "end" | null>(null);
  const [resultSet, setResultSet] = useState<any>();

  useEffect(() => {
    async function get() {
      const result = await database.getAllAsync(
        `SELECT 
        DATE(created_at) AS date,
        SUM(time) AS total_time
    FROM 
        timings
    WHERE 
        task_id IN (SELECT task_id FROM tasks WHERE project_id = ?)
        AND DATE(created_at) BETWEEN ? AND ?
    GROUP BY 
        DATE(created_at);`,
        project.project_id,
        startDate.toString(),
        endDate.toString()
      );

      setResultSet(result);
    }

    get();
  }, [endDate]);

  useEffect(() => {
    console.log("resultSet", resultSet);
  }, [resultSet]);

  const handleDeleteProject = () => {
    database.runAsync(
      "DELETE FROM projects WHERE project_id = ?;",
      project.project_id
    );
    navigation.navigate("Home");
  };

  const handleUpdateDate = (event, selectedDate) => {
    console.log(selectedDate);
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
        </View>

        <BarChart
          // style={graphStyle}
          data={{
            labels: ["January", "February", "March", "April", "May", "June"],
            datasets: [
              {
                data: [20, 45, 28, 80, 99, 43],
              },
            ],
          }}
          width={Dimensions.get("screen").width - 48}
          height={220}
          yAxisLabel="$"
          yAxisSuffix="%"
          chartConfig={chartConfig}
          verticalLabelRotation={30}
          fromZero={true}
        />

        {/* <Button
          buttonStyle={{ backgroundColor: "red" }}
          onPress={() => handleDeleteProject()}
          text="Apagar projeto"
        /> */}
      </View>
      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={datePickerValue}
          mode={"date"}
          is24Hour={true}
          onChange={handleUpdateDate}
          minimumDate={dateShown === "end" ? startDate : null}
          maximumDate={new Date()}
        />
      )}
    </>
  );
};

export default ProjectInfo;
