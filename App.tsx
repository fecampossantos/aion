// import { useCallback, useEffect, useState } from "react";

import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./Navigator";
// import useDatabase from "./hooks/useDatabase";

// import * as SplashScreen from "expo-splash-screen";
// import { View } from "react-native";

// Keep the splash screen visible while we fetch resources
// SplashScreen.preventAutoHideAsync();

export default function App() {
  // const [appIsReady, setAppIsReady] = useState<boolean>(false);
  // const { isDatabaseReady } = useDatabase();

  // useEffect(() => {
  //   if (isDatabaseReady) setAppIsReady(true);
  // }, [isDatabaseReady]);

  // const onLayoutRootView = useCallback(async () => {
  //   if (appIsReady) {
  //     await SplashScreen.hideAsync();
  //   }
  // }, [appIsReady]);

  // if (!appIsReady) {
  //   return null;
  // }

  return (
    <NavigationContainer>
      {/* <View
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        onLayout={onLayoutRootView}
      > */}
      <StackNavigator />
      {/* </View> */}
    </NavigationContainer>
  );
}
