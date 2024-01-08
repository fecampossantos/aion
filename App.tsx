import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./Navigator";
import useDatabase from "./hooks/useDatabase";
import {
  useFonts,
  OpenSans_400Regular,
  OpenSans_500Medium,
  OpenSans_700Bold,
} from "@expo-google-fonts/open-sans";

import * as SplashScreen from "expo-splash-screen";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const { isDatabaseReady } = useDatabase();
  let [fontsLoaded, fontError] = useFonts({
    OpenSans_400Regular,
    OpenSans_500Medium,
    OpenSans_700Bold,
  });

  if (!isDatabaseReady || !fontsLoaded || fontError) {
    return null;
  }

  SplashScreen.hideAsync();
  return (
    <NavigationContainer>
      <StackNavigator />
    </NavigationContainer>
  );
}
