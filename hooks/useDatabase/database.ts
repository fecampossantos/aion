import * as SQLite from "expo-sqlite";
import { DatabaseInfo, DatabaseType, SQLStatements } from "./constants";
import { Platform } from "react-native";

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

const createTables = () => {
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

const insertExamples = () => {
  db.transaction((tx: SQLite.SQLTransaction) => {
    tx.executeSql(
      SQLStatements.insert.insertIntoProjects,
      ["Example Project", 50.0],
      () => {},
      (tx, error) => {
        console.log(error);
        return false;
      }
    );
  });

  db.transaction((tx: SQLite.SQLTransaction) => {
    tx.executeSql(
      SQLStatements.retrieve.allProjects,
      [],
      (_, { rows }) => {
        const project_id = rows.item(0).project_id;

        tx.executeSql(
          SQLStatements.insert.insertIntoTasks,
          [project_id, "Task 1"],
          () => {},
          (tx, error) => {
            console.log(error);
            return false;
          }
        );
        tx.executeSql(
          SQLStatements.insert.insertIntoTasks,
          [project_id, "Task 2"],
          () => {},
          (tx, error) => {
            console.log(error);
            return false;
          }
        );
      },
      (tx, error) => {
        console.log(error);
        return false;
      }
    );
  });
};

const cleanTables = () => {
  db.transaction((tx: SQLite.SQLTransaction) => {
    tx.executeSql(
      SQLStatements.delete.deleteAllFromTimings,
      [],
      () => {},
      (tx, error) => {
        console.log(error);
        return false;
      }
    );
    tx.executeSql(
      SQLStatements.delete.deleteAllFromTasks,
      [],
      () => {},
      (tx, error) => {
        console.log(error);
        return false;
      }
    );
    tx.executeSql(
      SQLStatements.delete.deleteAllFromProjects,
      [],
      () => {},
      (tx, error) => {
        console.log(error);
        return false;
      }
    );
  });
};

const dropTables = () => {
  db.transaction((tx: SQLite.SQLTransaction) => {
    tx.executeSql(
      SQLStatements.drop.dropProjects,
      [],
      () => {},
      (tx, error) => {
        console.log(error);
        return false;
      }
    );
    tx.executeSql(
      SQLStatements.drop.dropTimings,
      [],
      () => {},
      (tx, error) => {
        console.log(error);
        return false;
      }
    );
    tx.executeSql(
      SQLStatements.drop.dropTasks,
      [],
      () => {},
      (tx, error) => {
        console.log(error);
        return false;
      }
    );
  });
};

const getAllProjects = (setProjects: (projects: any) => void) => {
  db.transaction((tx: SQLite.SQLTransaction) => {
    tx.executeSql(
      SQLStatements.retrieve.allProjects,
      [],
      (_, { rows }) => {
        setProjects(rows["_array"]);
      },
      (tx, error) => {
        console.log(error);
        return false;
      }
    );
  });
};

const getAllTasksFromProjectWithTimed = (
  projectId: number,
  setTasks: (tasks: any) => void
) => {
  db.transaction((tx: SQLite.SQLTransaction) => {
    tx.executeSql(
      SQLStatements.retrieve.allTasksFromProjectWithTimedUntilNow,
      [projectId],
      (_, { rows }) => {
        setTasks(rows._array);
      },
      (tx, error) => {
        console.log(error);
        return false;
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
      },
      (_, error) => {
        console.log(error);
        return false;
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
    tx.executeSql(
      SQLStatements.insert.insertIntoProjects,
      [projectName, projectHourlyCost],
      () => {},
      (tx, error) => {
        console.log(error);
        return false;
      }
    );
  });
};
const addNewTaskToProject = (taskName: string, projectID: number) => {
  db.transaction((tx: SQLite.SQLTransaction) => {
    tx.executeSql(
      SQLStatements.insert.insertIntoTasks,
      [projectID, taskName],
      () => {},
      (tx, error) => {
        console.log(error);
        return false;
      }
    );
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
      },
      (tx, error) => {
        console.log(error);
        return false;
      }
    );
  });
};

const getAllTimings = (setTimings: (timings: any) => void) => {
  db.transaction((tx) => {
    tx.executeSql(
      SQLStatements.retrieve.allTimings,
      [],
      (_, { rows }) => {
        setTimings(rows._array);
      },
      (tx, error) => {
        console.log(error);
        return false;
      }
    );
  });
};

const getProjectByName = (projectName: string) => {
  return db.transaction((tx: SQLite.SQLTransaction) => {
    tx.executeSql(
      SQLStatements.retrieve.countProjectsByName,
      [projectName],
      (_, { rows }) => {
        const count = rows.item(0).count;
        return count > 0;
      },
      (_, error) => {
        console.log(error);
        return false;
      }
    );
  });
};

const deleteProjectById = (projectID: number) => {
  db.transaction((tx) => {
    tx.executeSql(
      SQLStatements.delete.deleteFromProjectById,
      [projectID],
      () => {},
      (tx, error) => {
        console.log(error);
        return false;
      }
    );
  });
};

const deleteTaskById = (taskId: number) => {
  db.transaction((tx) => {
    tx.executeSql(
      SQLStatements.delete.deleteFromTaskById,
      [taskId],
      () => {},
      (tx, error) => {
        console.log(error);
        return false;
      }
    );
  });
};


const deleteTimingById = (timingID: number) => {
  db.transaction((tx) => {
    tx.executeSql(
      SQLStatements.delete.deleteFromTimingById,
      [timingID],
      () => {},
      (tx, error) => {
        console.log(error);
        return false;
      }
    );
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
  deleteTaskById,
  deleteTimingById
};
