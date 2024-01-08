import * as SQLite from "expo-sqlite";
import { DatabaseInfo, DatabaseType, SQLStatements } from "./constants";
import { Platform } from "react-native";
import Task from "../../interfaces/Task";

let db: DatabaseType | any;

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
  db.transaction((tx: SQLite.SQLTransaction) => {
    tx.executeSql(SQLStatements.create.createProjectsTable);
  });

  db.transaction((tx: SQLite.SQLTransaction) => {
    tx.executeSql(SQLStatements.create.createTasksTable);
  });

  db.transaction((tx: SQLite.SQLTransaction) => {
    tx.executeSql(SQLStatements.create.createTimingsTable);
  });
};

const insertExamples = async () => {
  db.transaction((tx: SQLite.SQLTransaction) => {
    tx.executeSql(SQLStatements.insert.insertIntoProjects, [
      "Example Project",
      50.0,
    ]);
  });

  db.transaction((tx: SQLite.SQLTransaction) => {
    tx.executeSql(SQLStatements.retrieve.allProjects, [], (_, { rows }) => {
      const project_id = rows.item(0).project_id;

      tx.executeSql(SQLStatements.insert.insertIntoTasks, [
        project_id,
        "Task 1",
      ]);
      tx.executeSql(SQLStatements.insert.insertIntoTasks, [
        project_id,
        "Task 2",
      ]);
    });
  });
};

const cleanTables = async () => {
  db.transaction((tx: SQLite.SQLTransaction) => {
    tx.executeSql(SQLStatements.delete.deleteAllFromTimings);
    tx.executeSql(SQLStatements.delete.deleteAllFromTasks);
    tx.executeSql(SQLStatements.delete.deleteAllFromProjects);
  });
};

const dropTables = async () => {
  db.transaction((tx: SQLite.SQLTransaction) => {
    tx.executeSql(SQLStatements.drop.dropProjects);
    tx.executeSql(SQLStatements.drop.dropTimings);
    tx.executeSql(SQLStatements.drop.dropTasks);
  });
};

const getAllProjects = async (setProjects: (projects: any) => void) => {
  db.transaction((tx: SQLite.SQLTransaction) => {
    tx.executeSql(
      SQLStatements.retrieve.allProjects,
      [],
      (_, { rows }) => {
        setProjects(rows["_array"]);
      },
      (tx, error) => {
        console.log("error", error);
        return false;
      }
    );
  });
};

const getAllTasksFromProjectWithTimed = async (
  projectId: number,
  setTasks: (tasks: any) => void
) => {
  db.transaction((tx: SQLite.SQLTransaction) => {
    tx.executeSql(
      SQLStatements.retrieve.allTasksFromProjectWithTimedUntilNow,
      [projectId],
      (_, { rows }) => {
        console.log(rows);
        setTasks(rows._array);
      },
      (tx, error) => {
        console.log("error", error);
        return true;
      }
    );
  });
};

const getTableNames = () => {
  db.transaction((tx: SQLite.SQLTransaction) => {
    tx.executeSql(
      `SELECT name FROM sqlite_master WHERE type='table';`,
      [],
      (_, { rows }) => {
        console.log(rows._array);
      }
    );
  });
};

const addTiming = (taskId: number, time: number) => {
  db.transaction((tx: SQLite.SQLTransaction) => {
    tx.executeSql(
      SQLStatements.insert.insertIntoTimings,
      [taskId, time],
      (_, { rows }) => {},
      (tx, error) => {
        console.log(error);
        return false;
      }
    );
  });
};

const addNewProject = (projectName: string, projectHourlyCost: number) => {
  db.transaction((tx: SQLite.SQLTransaction) => {
    tx.executeSql(SQLStatements.insert.insertIntoProjects, [
      projectName,
      projectHourlyCost,
    ]);
  });
};
const addNewTaskToProject = (taskName: string, projectID: number) => {
  db.transaction((tx: SQLite.SQLTransaction) => {
    tx.executeSql(SQLStatements.insert.insertIntoTasks, [projectID, taskName]);
  });
};

const getTimingsFromTask = (
  taskId: number,
  setTimings: (timings: any) => void
) => {
  db.transaction((tx) => {
    tx.executeSql(
      SQLStatements.retrieve.timingsFromTask,
      [taskId],
      (_, { rows }) => {
        setTimings(rows._array);
      }
    );
  });
};

const getAllTimings = (setTimings: (timings: any) => void) => {
  db.transaction((tx) => {
    tx.executeSql(SQLStatements.retrieve.allTimings, [], (_, { rows }) => {
      setTimings(rows._array);
    });
  });
};

const getProjectByName = async (projectName: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          SQLStatements.retrieve.countProjectsByName,
          [projectName],
          (_, { rows }) => {
            const count = rows.item(0).count;
            resolve(count > 0);
          },
          (_, error) => {
            reject(error);
          }
        );
      },
      (error) => {
        reject(error);
      }
    );
  });
};

const deleteProjectById = async (projectID: number) => {
  db.transaction((tx) => {
    tx.executeSql(SQLStatements.delete.deleteFromProjectById, [projectID]);
  });
};

const deleteTaskById = async (taskId: number) => {
  db.transaction((tx) => {
    tx.executeSql(SQLStatements.delete.deleteFromTaskById, [taskId]);
  });
};

export const database = {
  cleanTables,
  insertExamples,
  createTables,
  getAllProjects,
  getAllTasksFromProjectWithTimed,
  addTiming,
  dropTables,
  getTableNames,
  addNewProject,
  getProjectByName,
  deleteProjectById,
  addNewTaskToProject,
  getTimingsFromTask,
  getAllTimings,
  deleteTaskById
};
