// force the state to clear with fast refresh in Expo
// @refresh reset
import { useState, useEffect } from "react";
import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";
import { DatabaseType, DatabaseInfo, SQLStatements } from "./constants";

import { database } from "./database";

const useDatabase = () => {
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);

  useEffect(() => {
    async function loadDataAsync() {
      try {
        database.cleanTables();
        database.createTables();
        database.insertExamples();

        setIsDatabaseReady(true);
      } catch (e) {
        console.warn(e);
      }
    }

    loadDataAsync();
  }, []);

  useEffect(() => {
    console.log("isDatabaseReady", isDatabaseReady);
  }, [isDatabaseReady]);

  return { isDatabaseReady };

  // function createTables() {
  //   db.transaction((tx) => {
  //     tx.executeSql(SQLStatements.create.createProjectsTable);
  //   });

  //   db.transaction((tx) => {
  //     tx.executeSql(SQLStatements.create.createTasksTable);
  //   });

  //   db.transaction((tx) => {
  //     tx.executeSql(SQLStatements.create.createTimingsTable);
  //   });
  // }

  // function insertExamples() {
  //   db.transaction((tx) => {
  //     tx.executeSql(SQLStatements.insert.insertIntoProjects, [
  //       "Example Project",
  //       50.0,
  //     ]);
  //   });

  //   db.transaction((tx) => {
  //     tx.executeSql(SQLStatements.getLastAddedId, [], (_, { rows }) => {
  //       const project_id = rows.item(0).project_id;

  //       tx.executeSql(SQLStatements.insert.insertIntoTasks, [
  //         project_id,
  //         "Task 1",
  //         0,
  //       ]);
  //       tx.executeSql(SQLStatements.insert.insertIntoTasks, [
  //         project_id,
  //         "Task 2",
  //         1,
  //       ]);
  //     });
  //   });
  // }

  // function cleanDatabases() {
  //   db.transaction((tx) => {
  //     tx.executeSql(SQLStatements.delete.deleteAllFromTimings);
  //     tx.executeSql(SQLStatements.delete.deleteAllFromTasks);
  //     tx.executeSql(SQLStatements.delete.deleteAllFromProjects);
  //   });
  // }

  // function getAllProjects(setProjects: (projects: any) => void) {
  //   console.log(db);
  //   db.transaction((tx) => {
  //     tx.executeSql("select * from projects", [], (_, { rows }) => {
  //       console.log("projects", JSON.stringify(rows["_array"]));
  //       setProjects(rows["_array"]);
  //     });
  //   });
  // }

  // return {
  // db,
  // isDatabaseReady,
  // cleanDatabases,
  // openDatabase,
  // initialize,
  // createTables,
  // getAllProjects,
  // };
};

export default useDatabase;
