import * as SQLite from "expo-sqlite";
import { DatabaseInfo, DatabaseType, SQLStatements } from "./constants";
import { Platform } from "react-native";
import Task from "../../interfaces/Task";

let db: DatabaseType;

if (Platform.OS === "web") {
  db = {
    transaction: () => ({
      executeSql: () => {
        console.warn("executeSql is not supported on web");
      },
    }),
  };
} else {
  db = SQLite.openDatabase(
    DatabaseInfo.NAME,
    DatabaseInfo.VERSION,
    DatabaseInfo.DESCRIPTION,
    DatabaseInfo.SIZE
  );
}

const createTables = async () => {
  db.transaction((tx) => {
    tx.executeSql(SQLStatements.create.createProjectsTable);
  });

  db.transaction((tx) => {
    tx.executeSql(SQLStatements.create.createTasksTable);
  });

  db.transaction((tx) => {
    tx.executeSql(SQLStatements.create.createTimingsTable);
  });
};

const insertExamples = async () => {
  db.transaction((tx) => {
    tx.executeSql(SQLStatements.insert.insertIntoProjects, [
      "Example Project",
      50.0,
    ]);
  });

  db.transaction((tx) => {
    tx.executeSql(SQLStatements.getLastAddedId, [], (_, { rows }) => {
      const project_id = rows.item(0).project_id;

      tx.executeSql(SQLStatements.insert.insertIntoTasks, [
        project_id,
        "Task 1",
        0,
      ]);
      tx.executeSql(SQLStatements.insert.insertIntoTasks, [
        project_id,
        "Task 2",
        1,
      ]);
    });
  });
};

const cleanTables = async () => {
  db.transaction((tx) => {
    tx.executeSql(SQLStatements.delete.deleteAllFromTimings);
    tx.executeSql(SQLStatements.delete.deleteAllFromTasks);
    tx.executeSql(SQLStatements.delete.deleteAllFromProjects);
  });
};

const dropTables = async () => {
  db.transaction((tx) => {
    tx.executeSql(SQLStatements.drop.dropProjects);
    tx.executeSql(SQLStatements.drop.dropTimings);
    tx.executeSql(SQLStatements.drop.dropTasks);
  });
};

const getAllProjects = async (setProjects: (projects: any) => void) => {
  db.transaction((tx) => {
    tx.executeSql(
      SQLStatements.retrieve.allProjects,
      [],
      (_, { rows }) => {
        setProjects(rows["_array"]);
      },
      (tx, error) => {
        console.log("error", error);
        return true;
      }
    );
  });
};

const getAllTasksFromProject = async (
  projectId: number,
  setTasks: (tasks: any) => void
) => {
  db.transaction((tx) => {
    tx.executeSql(
      SQLStatements.retrieve.allTasksFromProjects,
      [projectId],
      (_, { rows }) => {
        setTasks(rows._array);
      },
      (tx, error) => {
        console.log("error", error);
        return true;
      }
    );
  });
};

const addNewTiming = (task: Task, time: number) => {};

const getTableNames = () => {
  db.transaction((tx) => {
    tx.executeSql(
      `SELECT name FROM sqlite_master WHERE type='table';`,
      [],
      (_, { rows }) => {
        console.log(rows._array);
      }
    );
  });
};

export const database = {
  cleanTables,
  insertExamples,
  createTables,
  getAllProjects,
  getAllTasksFromProject,
  addNewTiming,
  dropTables,
  getTableNames,
};
