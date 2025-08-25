import { Slot } from "expo-router";
import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { theme } from "../globalStyle/theme";
import { useGoogleFonts } from "../globalStyle/fonts";
import { View, Text } from "react-native";
import { ToastProvider } from "../components/Toast/ToastContext";
import { useEffect } from "react";
import { NotificationHandler } from "../utils/notificationHandler";
import "../i18n";

export default function HomeLayout() {
  const { fontsLoaded, fontError } = useGoogleFonts();

  // Initialize notification handler
  useEffect(() => {
    const initializeNotifications = async () => {
      const notificationHandler = NotificationHandler.getInstance();
      await notificationHandler.initialize();
    };

    if (fontsLoaded) {
      initializeNotifications();
    }
  }, [fontsLoaded]);

  // Show loading screen while fonts are loading
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.neutral[900], justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: theme.colors.white, fontSize: 18 }}>Loading fonts...</Text>
      </View>
    );
  }

  // Show error screen if fonts fail to load
  if (fontError) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.neutral[900], justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: theme.colors.error[500], fontSize: 18 }}>Error loading fonts</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.neutral[900] }}>
      <StatusBar style="light" />
      <ToastProvider>
        <SQLiteProvider
          databaseName="aionMainDatabase.db"
          onInit={migrateDbIfNeeded}
          useSuspense
        >
          <Slot />
        </SQLiteProvider>
      </ToastProvider>
    </SafeAreaView>
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
      "Sample Project",
      10
    );
    await db.runAsync(
      "INSERT INTO tasks (project_id, name, completed) VALUES (?, ?, ?);",
      1,
      "Sample Task",
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
