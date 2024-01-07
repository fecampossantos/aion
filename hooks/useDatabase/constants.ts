import { SQLiteDatabase } from "expo-sqlite";

export type DatabaseType =
  | SQLiteDatabase
  | { transaction: () => { executeSql: () => void } }
  | null;

export enum DatabaseInfo {
  NAME = "chronoMainDatabase.database",
  VERSION = "1.0",
  DESCRIPTION = "Chrono Main Database",
  SIZE = 200000,
}

export const SQLStatements = {
  create: {
    createProjectsTable: `CREATE TABLE IF NOT EXISTS projects (
            project_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            hourlyCost REAL NOT NULL
            );`,
    createTasksTable: `CREATE TABLE IF NOT EXISTS tasks (
                task_id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER,
                name TEXT NOT NULL,
                completed INTEGER NOT NULL DEFAULT 0,
                FOREIGN KEY (project_id) REFERENCES PROJECT(project_id) ON DELETE CASCADE
              );`,
    createTimingsTable: `CREATE TABLE IF NOT EXISTS timings (
                timing_id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_id INTEGER,
                startedAt DATETIME NOT NULL,
                stoppedAt DATETIME,
                FOREIGN KEY (task_id) REFERENCES TASK(task_id) ON DELETE CASCADE
              );`,
  },
  insert: {
    insertIntoProjects:
      "INSERT INTO projects (name, hourlyCost) VALUES (?, ?);",
    insertIntoTasks:
      "INSERT INTO tasks (project_id, name, completed) VALUES (?, ?, ?);",
  },
  delete: {
    deleteAllFromProjects: "DELETE FROM projects;",
    deleteAllFromTasks: "DELETE FROM tasks;",
    deleteAllFromTimings: "DELETE FROM timings;",
  },
  retrieve: {
    allTasksFromProjects: `
    SELECT
      tasks.*,
      COALESCE(SUM(timings.stoppedAt - timings.startedAt), 0) AS timed
    FROM
      tasks
    LEFT JOIN
      timings ON tasks.task_id = timings.task_id
    WHERE
      tasks.project_id = ?
    GROUP BY
      tasks.task_id;
  `,
  },

  getLastAddedId: "SELECT last_insert_rowid() as project_id",
};
