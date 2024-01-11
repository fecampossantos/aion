import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./Navigator";
import useDatabase from "./hooks/useDatabase";
import {
  useFonts,
  OpenSans_400Regular,
  OpenSans_500Medium,
  OpenSans_700Bold,
  OpenSans_400Regular_Italic,
  OpenSans_500Medium_Italic,
  OpenSans_700Bold_Italic,
} from "@expo-google-fonts/open-sans";

import * as SplashScreen from "expo-splash-screen";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const { isDatabaseReady, database } = useDatabase();
  let [fontsLoaded, fontError] = useFonts({
    OpenSans_400Regular,
    OpenSans_500Medium,
    OpenSans_700Bold,
    OpenSans_400Regular_Italic,
    OpenSans_500Medium_Italic,
    OpenSans_700Bold_Italic,
  });

  if (!isDatabaseReady || !fontsLoaded) {
    if (fontError) console.log("Error loading font: ", fontError);
    return null;
  }

  // database.cleanTables();
  // database.dropTables();
  database.createTables();
  // database.insertExamples();
  // database.getTableNames();

  SplashScreen.hideAsync();
  return (
    <NavigationContainer>
      <StackNavigator />
    </NavigationContainer>
  );
}
