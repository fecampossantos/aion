import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Home from "./src/screens/Home";
import Project from "./src/screens/Project";
import AddProject from "./src/screens/AddProject";
import ProjectInfo from "./src/screens/ProjectInfo";
import AddTaskModal from "./src/screens/AddTaskModal";
import AddRecordModal from "./src/screens/AddRecordModal";
import Task from "./src/screens/Task";
import Report from "./src/screens/Report";

import globalStyle from "./src/globalStyle";
import EditProject from "./src/screens/EditProject";

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  const headerStyles = {
    headerTitleStyle: {
      fontFamily: globalStyle.font.bold,
      fontSize: 20,
      color: globalStyle.white,
    },
    headerStyle: { backgroundColor: globalStyle.background },
    headerTintColor: globalStyle.white,
  };

  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        component={Home}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Project"
        component={Project}
        options={{
          ...headerStyles,
        }}
      />
      <Stack.Screen
        name="AddProject"
        component={AddProject}
        options={{
          title: "Novo projeto",
          ...headerStyles,
        }}
      />
      <Stack.Screen
        name="ProjectInfo"
        component={ProjectInfo}
        options={{
          ...headerStyles,
        }}
      />
      <Stack.Screen
        name="Task"
        component={Task}
        options={{
          ...headerStyles,
        }}
      />
      <Stack.Screen
        name="EditProject"
        component={EditProject}
        options={{
          title: "Editar projeto",
          ...headerStyles,
        }}
      />

      {/* MODALS */}
      <Stack.Screen
        name="AddTaskModal"
        component={AddTaskModal}
        options={{
          animation: "slide_from_bottom",
          headerShown: true,
          ...headerStyles,
        }}
      />
      <Stack.Screen
        name="Report"
        component={Report}
        options={{
          animation: "slide_from_bottom",
          headerShown: true,
          ...headerStyles,
        }}
      />
      <Stack.Screen
        name="AddRecordModal"
        component={AddRecordModal}
        options={{
          animation: "slide_from_bottom",
          headerShown: true,
          ...headerStyles,
        }}
      />
    </Stack.Navigator>
  );
};

export default StackNavigator;
