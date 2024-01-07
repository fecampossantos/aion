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
    createProjectsTable: `CREATE TABLE projects (
            project_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            hourly_cost REAL NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );`,
    createTasksTable: `CREATE TABLE IF NOT EXISTS tasks (
                task_id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER,
                name TEXT NOT NULL,
                completed INTEGER NOT NULL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES PROJECT(project_id) ON DELETE CASCADE
              );`,
    createTimingsTable: `CREATE TABLE IF NOT EXISTS timings (
                timing_id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_id INTEGER,
                time INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (task_id) REFERENCES TASK(task_id) ON DELETE CASCADE
              );`,
  },
  insert: {
    insertIntoProjects:
      "INSERT INTO projects (name, hourly_cost) VALUES (?, ?);",
    insertIntoTasks:
      "INSERT INTO tasks (project_id, name, completed) VALUES (?, ?, ?);",
    insertIntoTimings:
      "INSERT INTO timings (task_id, startedAt, stoppedAt) VALUES (?, ?, ?);",
  },
  delete: {
    deleteAllFromProjects: "DELETE FROM projects;",
    deleteAllFromTasks: "DELETE FROM tasks;",
    deleteAllFromTimings: "DELETE FROM timings;",
  },
  drop: {
    dropTimings: "DROP TABLE IF EXISTS timings",
    dropTasks: "DROP TABLE IF EXISTS tasks",
    dropProjects: "DROP TABLE IF EXISTS projects",
  },

  retrieve: {
    allProjects: "SELECT * FROM projects",
    allTasksFromProjects: `
    SELECT
      *
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
