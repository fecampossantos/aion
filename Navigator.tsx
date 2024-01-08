import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./src/screens/Home";
import Project from "./src/screens/Project";
import AddProject from "./src/screens/AddProject";
import ProjectInfo from "./src/screens/ProjectInfo";
import AddTaskModal from "./src/screens/AddTaskModal";
import Task from "./src/screens/Task";

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        component={Home}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="Project" component={Project} />
      <Stack.Screen name="AddProject" component={AddProject} />
      <Stack.Screen name="ProjectInfo" component={ProjectInfo} />
      <Stack.Screen
        name="AddTaskModal"
        component={AddTaskModal}
        options={{ animation: "slide_from_bottom", headerShown: true }}
      />
      <Stack.Screen name="Task" component={Task} />
    </Stack.Navigator>
  );
};

export default StackNavigator;
