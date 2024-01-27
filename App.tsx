import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./Navigator";
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
import { Suspense, useEffect } from "react";

import { SQLiteProvider, type SQLiteDatabase } from "expo-sqlite/next";
import { Text, View } from "react-native";

const Fallback = () => (
  <View>
    <Text>Carregando...</Text>
  </View>
);

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  let [fontsLoaded, fontError] = useFonts({
    OpenSans_400Regular,
    OpenSans_500Medium,
    OpenSans_700Bold,
    OpenSans_400Regular_Italic,
    OpenSans_500Medium_Italic,
    OpenSans_700Bold_Italic,
  });

  if (!fontsLoaded) {
    if (!fontsLoaded) console.log("Fonts not loaded. Waiting.");
    if (fontError) console.log("Error loading font: ", fontError);
    return null;
  }

  SplashScreen.hideAsync();
  return (
    <Suspense fallback={<Fallback />}>
      <NavigationContainer>
        <SQLiteProvider
          databaseName="chronoMainDatabase.db"
          onInit={migrateDbIfNeeded}
          useSuspense
        >
          <StackNavigator />
        </SQLiteProvider>
      </NavigationContainer>
    </Suspense>
  );
}

async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const DATABASE_VERSION = 1;
  let { user_version: currentDbVersion } = await db.getFirstAsync<{
    user_version: number;
  }>("PRAGMA user_version");
  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }
  if (currentDbVersion === 0) {
    await db.execAsync(`
  PRAGMA journal_mode = 'wal';

  CREATE TABLE IF NOT EXISTS projects (
    project_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    hourly_cost REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

  CREATE TABLE IF NOT EXISTS tasks (
    task_id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    name TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS timings (
    timing_id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER,
    time INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
  );
`);
    await db.runAsync(
      "INSERT INTO projects (name, hourly_cost) VALUES (?, ?);",
      "projeto exemplo",
      10
    );
    await db.runAsync(
      "INSERT INTO tasks (project_id, name, completed) VALUES (?, ?, ?);",
      1,
      "task exemplo",
      false
    );
    await db.runAsync(
      "INSERT INTO timings (task_id, time) VALUES (?, ?);",
      0,
      10
    );
    await db.runAsync(
      "INSERT INTO timings (task_id, time) VALUES (?, ?);",
      0,
      128
    );

    currentDbVersion = 1;
  }
  // if (currentDbVersion === 1) {
  //   Add more migrations
  // }
  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
