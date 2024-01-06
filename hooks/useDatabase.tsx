import { useState, useEffect } from "react";
import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";

const useDatabase = () => {
  const [db, setDB] = useState(null);
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);

  function openDatabase() {
    if (Platform.OS === "web") {
      // Mock SQLite for web
      return {
        transaction: () => ({
          executeSql: () => {
            console.warn("executeSql is not supported on web");
          },
        }),
      };
    }

    const database = SQLite.openDatabase(
      "chronoMainDatabase.database",
      "1.0",
      "Chrono Main Database",
      200000,
      () => {
        setIsDatabaseReady(true);
      }
    );
    return database;
  }

  useEffect(() => {
    function createTables(
      db:
        | SQLite.SQLiteDatabase
        | { transaction: () => { executeSql: () => void } }
    ) {
      db.transaction((tx) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS projects (
              project_id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              hourlyCost REAL NOT NULL
            );`
        );
      });

      // Create TASK table if not exists
      db.transaction((tx) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS tasks (
              task_id INTEGER PRIMARY KEY AUTOINCREMENT,
              project_id INTEGER,
              name TEXT NOT NULL,
              completed INTEGER NOT NULL DEFAULT 0,
              FOREIGN KEY (project_id) REFERENCES PROJECT(project_id) ON DELETE CASCADE
            );`
        );
      });

      // Create TIMING table if not exists
      db.transaction((tx) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS timings (
              timing_id INTEGER PRIMARY KEY AUTOINCREMENT,
              task_id INTEGER,
              startedAt DATETIME NOT NULL,
              stoppedAt DATETIME,
              FOREIGN KEY (task_id) REFERENCES TASK(task_id) ON DELETE CASCADE
            );`
        );
      });
    }

    function insertExamples(db) {
      db.transaction((tx) => {
        tx.executeSql(
          "INSERT INTO projects (name, hourlyCost) VALUES (?, ?);",
          ["Example Project", 50.0]
        );
      });

      // Get the project_id of the inserted project
      db.transaction((tx) => {
        tx.executeSql(
          "SELECT last_insert_rowid() as project_id",
          [],
          (_, { rows }) => {
            const project_id = rows.item(0).project_id;

            // Insert example tasks for the project
            tx.executeSql(
              "INSERT INTO tasks (project_id, name, completed) VALUES (?, ?, ?);",
              [project_id, "Task 1", 0]
            );
            tx.executeSql(
              "INSERT INTO tasks (project_id, name, completed) VALUES (?, ?, ?);",
              [project_id, "Task 2", 1]
            );
          }
        );
      });
    }

    const database = openDatabase();
    createTables(database);
    // insertExamples(database);
    setDB(database);
  }, []);

  const cleanDatabase = () => {
    db.transaction((tx) => {
      // Delete all rows from the TIMING table
      tx.executeSql("DELETE FROM timings;");

      // Delete all rows from the TASK table
      tx.executeSql("DELETE FROM tasks;");

      // Delete all rows from the PROJECT table
      tx.executeSql("DELETE FROM projects;");
    });
  };

  return {
    db,
    isDatabaseReady,
    cleanDatabase,
    openDatabase,
  };
};

export default useDatabase;
