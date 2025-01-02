import {
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import styles, { chartConfig } from "./styles";
import Button from "../../components/Button";
import { Feather } from "@expo/vector-icons";

import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect } from "react";

import { fullDate } from "../../utils/parser";
import globalStyle from "../../globalStyle";

import { BarChart } from "react-native-chart-kit";
import { useLocalSearchParams, router } from "expo-router";

import useReport from "./useReport";

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
