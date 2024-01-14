import { SQLiteDatabase } from "expo-sqlite";

export type DatabaseType = SQLiteDatabase | null;

export enum DatabaseInfo {
  NAME = "chronoMainDatabase.database",
  VERSION = "1.2",
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
                FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
              );`,
    createTimingsTable: `CREATE TABLE IF NOT EXISTS timings (
                timing_id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_id INTEGER,
                time INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
              );`,
  },
  insert: {
    insertIntoProjects:
      "INSERT INTO projects (name, hourly_cost) VALUES (?, ?);",
    insertIntoTasks:
      "INSERT INTO tasks (project_id, name, completed) VALUES (?, ?, 0);",
    insertIntoTimings: "INSERT INTO timings (task_id, time) VALUES (?, ?);",
  },
  delete: {
    deleteAllFromProjects: "DELETE FROM projects;",
    deleteAllFromTasks: "DELETE FROM tasks;",
    deleteAllFromTimings: "DELETE FROM timings;",
    deleteFromProjectById: "DELETE FROM projects WHERE project_id = ?;",
    deleteFromTaskById: "DELETE FROM tasks WHERE task_id = ?;",
    deleteFromTimingById: "DELETE FROM timings WHERE timing_id = ?;",
  },
  drop: {
    dropTimings: "DROP TABLE IF EXISTS timings;",
    dropTasks: "DROP TABLE IF EXISTS tasks;",
    dropProjects: "DROP TABLE IF EXISTS projects;",
  },

  retrieve: {
    allProjects: "SELECT * FROM projects;",
    allTimings: "SELECT * FROM timings;",
    allTasksFromProject: `SELECT * FROM tasks WHERE tasks.project_id = ?;`,
    allTasksFromProjectWithTimedUntilNow: `SELECT 
    t.task_id,
    t.name,
    t.completed,
    t.created_at AS task_created_at,
    COALESCE(SUM(ti.time), 0) AS timed_until_now
FROM 
    tasks t
LEFT JOIN 
    timings ti ON t.task_id = ti.task_id
WHERE 
    t.project_id = ? -- Replace ? with the actual project_id
GROUP BY 
    t.task_id, t.name, t.completed, t.created_at
ORDER BY 
    t.created_at;`,
    countProjectsByName:
      "SELECT COUNT(*) AS count FROM projects WHERE name = ?;",
    timingsFromTask: "SELECT * FROM timings WHERE task_id = ? ORDER BY created_at DESC;",
  },

  getLastAddedId: "SELECT last_insert_rowid() as project_id;",
};
