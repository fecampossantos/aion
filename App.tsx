import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./Navigator";
import useDatabase from "./hooks/useDatabase";

import * as SplashScreen from "expo-splash-screen";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const { isDatabaseReady } = useDatabase();
  
  if (!isDatabaseReady) {
    return null;
  }
  
  SplashScreen.hideAsync()
  return (
    <NavigationContainer>
      <StackNavigator />
    </NavigationContainer>
  );
}
