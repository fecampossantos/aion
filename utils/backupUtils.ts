import { SQLiteDatabase } from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

/**
 * Interface for backup data structure
 */
export interface BackupData {
  version: string;
  timestamp: string;
  data: {
    projects: Array<{
      project_id: number;
      name: string;
      hourly_cost: number;
      created_at: string;
    }>;
    tasks: Array<{
      task_id: number;
      project_id: number;
      name: string;
      completed: number;
      created_at: string;
    }>;
    timings: Array<{
      timing_id: number;
      task_id: number;
      time: number;
      created_at: string;
    }>;
  };
}

/**
 * Creates a backup of all database data
 * @param db - SQLite database instance
 * @returns Promise<BackupData> - The backup data
 */
export async function createBackup(db: SQLiteDatabase): Promise<BackupData> {
  try {
    // Fetch all data from database
    const projects = await db.getAllAsync<{
      project_id: number;
      name: string;
      hourly_cost: number;
      created_at: string;
    }>("SELECT * FROM projects ORDER BY project_id;");
    
    const tasks = await db.getAllAsync<{
      task_id: number;
      project_id: number;
      name: string;
      completed: number;
      created_at: string;
    }>("SELECT * FROM tasks ORDER BY task_id;");
    
    const timings = await db.getAllAsync<{
      timing_id: number;
      task_id: number;
      time: number;
      created_at: string;
    }>("SELECT * FROM timings ORDER BY timing_id;");

    const backupData: BackupData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        projects,
        tasks,
        timings
      }
    };

    return backupData;
  } catch (error) {
    console.error('Error creating backup:', error);
    throw new Error('Failed to create backup');
  }
}

/**
 * Exports backup data to a JSON file and saves it to device storage
 * @param db - SQLite database instance
 * @param filename - Optional filename for the backup file
 * @returns Promise<string> - Path to the created backup file
 */
export async function exportBackupToFile(
  db: SQLiteDatabase,
  filename?: string
): Promise<string> {
  try {
    // Create backup data
    const backupData = await createBackup(db);

    // Generate filename if not provided
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilename = filename || `aion-backup-${timestamp}.json`;

    // Create file path in document directory
    const filePath = `${FileSystem.documentDirectory}${backupFilename}`;

    // Write backup data to file
    await FileSystem.writeAsStringAsync(
      filePath,
      JSON.stringify(backupData, null, 2),
      { encoding: FileSystem.EncodingType.UTF8 }
    );

    return filePath;
  } catch (error) {
    console.error('Error exporting backup to file:', error);
    throw new Error('Failed to export backup to file');
  }
}

/**
 * Downloads backup file to device storage and opens share dialog
 * @param db - SQLite database instance
 * @param filename - Optional filename for the backup file
 */
export async function downloadBackup(
  db: SQLiteDatabase,
  filename?: string
): Promise<void> {
  try {
    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Sharing is not available on this device');
    }

    // Export backup to file
    const filePath = await exportBackupToFile(db, filename);

    // Get file info for confirmation
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (!fileInfo.exists) {
      throw new Error('Backup file was not created successfully');
    }

    // Share the file (this will open the system share dialog)
    await Sharing.shareAsync(filePath, {
      mimeType: 'application/json',
      dialogTitle: 'Save Aion Backup',
      UTI: 'public.json'
    });

    // Show success message
    Alert.alert(
      'Backup Created',
      `Backup file has been created and saved to your device.\n\nFile: ${filename || 'aion-backup.json'}\nSize: ${Math.round((fileInfo.size || 0) / 1024)} KB`
    );

  } catch (error) {
    console.error('Error downloading backup:', error);
    throw error;
  }
}

/**
 * Restores database from backup data
 * @param db - SQLite database instance
 * @param backupData - The backup data to restore
 */
export async function restoreFromBackup(
  db: SQLiteDatabase,
  backupData: BackupData
): Promise<void> {
  try {
    // Validate backup data structure
    if (!backupData.data || !backupData.data.projects || !backupData.data.tasks || !backupData.data.timings) {
      throw new Error('Invalid backup data structure');
    }

    // Begin transaction for data integrity
    await db.execAsync('BEGIN TRANSACTION;');

    try {
      // Clear existing data
      await db.runAsync("DELETE FROM timings;");
      await db.runAsync("DELETE FROM tasks;");
      await db.runAsync("DELETE FROM projects;");

      // Reset auto-increment counters
      await db.runAsync("DELETE FROM sqlite_sequence WHERE name IN ('projects', 'tasks', 'timings');");

      // Restore projects
      for (const project of backupData.data.projects) {
        await db.runAsync(
          "INSERT INTO projects (project_id, name, hourly_cost, created_at) VALUES (?, ?, ?, ?);",
          project.project_id,
          project.name,
          project.hourly_cost,
          project.created_at
        );
      }

      // Restore tasks
      for (const task of backupData.data.tasks) {
        await db.runAsync(
          "INSERT INTO tasks (task_id, project_id, name, completed, created_at) VALUES (?, ?, ?, ?, ?);",
          task.task_id,
          task.project_id,
          task.name,
          task.completed,
          task.created_at
        );
      }

      // Restore timings
      for (const timing of backupData.data.timings) {
        await db.runAsync(
          "INSERT INTO timings (timing_id, task_id, time, created_at) VALUES (?, ?, ?, ?);",
          timing.timing_id,
          timing.task_id,
          timing.time,
          timing.created_at
        );
      }

      // Update auto-increment counters to prevent ID conflicts
      if (backupData.data.projects.length > 0) {
        const maxProjectId = Math.max(...backupData.data.projects.map(p => p.project_id));
        await db.runAsync("UPDATE sqlite_sequence SET seq = ? WHERE name = 'projects';", maxProjectId);
      }

      if (backupData.data.tasks.length > 0) {
        const maxTaskId = Math.max(...backupData.data.tasks.map(t => t.task_id));
        await db.runAsync("UPDATE sqlite_sequence SET seq = ? WHERE name = 'tasks';", maxTaskId);
      }

      if (backupData.data.timings.length > 0) {
        const maxTimingId = Math.max(...backupData.data.timings.map(t => t.timing_id));
        await db.runAsync("UPDATE sqlite_sequence SET seq = ? WHERE name = 'timings';", maxTimingId);
      }

      // Commit transaction
      await db.execAsync('COMMIT;');

    } catch (error) {
      // Rollback transaction on error
      await db.execAsync('ROLLBACK;');
      throw error;
    }

  } catch (error) {
    console.error('Error restoring from backup:', error);
    throw new Error('Failed to restore from backup');
  }
}

/**
 * Restores database from a backup file
 * @param db - SQLite database instance
 * @param filePath - Path to the backup file
 */
export async function restoreFromFile(
  db: SQLiteDatabase,
  filePath: string
): Promise<void> {
  try {
    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (!fileInfo.exists) {
      throw new Error('Backup file not found');
    }

    // Read file content
    const fileContent = await FileSystem.readAsStringAsync(filePath, {
      encoding: FileSystem.EncodingType.UTF8
    });

    // Parse JSON data
    let backupData: BackupData;
    try {
      backupData = JSON.parse(fileContent);
    } catch (parseError) {
      throw new Error('Invalid backup file format');
    }

    // Restore from backup data
    await restoreFromBackup(db, backupData);

  } catch (error) {
    console.error('Error restoring from file:', error);
    throw error;
  }
}

/**
 * Gets statistics about a backup file
 * @param filePath - Path to the backup file
 * @returns Promise<object> - Backup statistics
 */
export async function getBackupStats(filePath: string): Promise<{
  projects: number;
  tasks: number;
  timings: number;
  timestamp: string;
  version: string;
  fileSize: number;
}> {
  try {
    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (!fileInfo.exists) {
      throw new Error('Backup file not found');
    }

    // Read file content
    const fileContent = await FileSystem.readAsStringAsync(filePath, {
      encoding: FileSystem.EncodingType.UTF8
    });

    // Parse JSON data
    const backupData: BackupData = JSON.parse(fileContent);

    return {
      projects: backupData.data.projects.length,
      tasks: backupData.data.tasks.length,
      timings: backupData.data.timings.length,
      timestamp: backupData.timestamp,
      version: backupData.version,
      fileSize: fileInfo.size || 0
    };

  } catch (error) {
    console.error('Error getting backup stats:', error);
    throw new Error('Failed to read backup file statistics');
  }
}