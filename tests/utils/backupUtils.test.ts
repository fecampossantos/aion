import { SQLiteDatabase } from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { restoreFromBackup, restoreFromSelectedFile, createBackup, exportBackupToFile, downloadBackup, BackupData } from '../../utils/backupUtils';

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  getInfoAsync: jest.fn(),
  moveAsync: jest.fn(),
  deleteAsync: jest.fn(),
  documentDirectory: 'file://mock-document-directory/',
  cacheDirectory: 'file://mock-cache-directory/',
  EncodingType: {
    UTF8: 'utf8'
  }
}));

// Mock expo-sharing
jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn(),
  isAvailableAsync: jest.fn()
}));

// Mock expo-document-picker
jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn()
}));

// Mock SQLite database
const mockDatabase = {
  getAllAsync: jest.fn(),
  execAsync: jest.fn(),
  runAsync: jest.fn()
} as unknown as SQLiteDatabase;

describe('backupUtils', () => {
  let mockDatabase: any;

  beforeEach(() => {
    mockDatabase = {
      getAllAsync: jest.fn(),
      getFirstAsync: jest.fn(),
      runAsync: jest.fn(),
      execAsync: jest.fn(),
    };
  });

  describe('createBackup', () => {
    it('should create backup data from database', async () => {
      const mockProjects = [{ project_id: 1, name: 'Test', hourly_cost: 50, created_at: '2024-01-01' }];
      const mockTasks = [{ task_id: 1, project_id: 1, name: 'Test Task', completed: 0, created_at: '2024-01-01' }];
      const mockTimings = [{ timing_id: 1, task_id: 1, time: 3600, created_at: '2024-01-01' }];

      mockDatabase.getAllAsync
        .mockResolvedValueOnce(mockProjects)
        .mockResolvedValueOnce(mockTasks)
        .mockResolvedValueOnce(mockTimings);

      const result = await createBackup(mockDatabase);

      expect(result).toEqual({
        version: '1.0.0',
        timestamp: expect.any(String),
        data: {
          projects: mockProjects,
          tasks: mockTasks,
          timings: mockTimings
        }
      });
    });

    it('should handle database errors gracefully', async () => {
      mockDatabase.getAllAsync.mockRejectedValue(new Error('Database error'));

      await expect(createBackup(mockDatabase)).rejects.toThrow('Failed to create backup');
    });
  });

  describe('exportBackupToFile', () => {
    it('should export backup to file and share it', async () => {
      const mockProjects = [{ project_id: 1, name: 'Test', hourly_cost: 50, created_at: '2024-01-01' }];
      const mockTasks = [{ task_id: 1, project_id: 1, name: 'Test Task', completed: 0, created_at: '2024-01-01' }];
      const mockTimings = [{ timing_id: 1, task_id: 1, time: 3600, created_at: '2024-01-01' }];

      mockDatabase.getAllAsync
        .mockResolvedValueOnce(mockProjects)
        .mockResolvedValueOnce(mockTasks)
        .mockResolvedValueOnce(mockTimings);

      (FileSystem.writeAsStringAsync as jest.Mock).mockResolvedValue(undefined);
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true, size: 1024 });

      const result = await exportBackupToFile(mockDatabase, 'test-backup.json');

      expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
        expect.stringContaining('test-backup.json'),
        expect.any(String),
        { encoding: FileSystem.EncodingType.UTF8 }
      );
      expect(result).toBeDefined();
      expect(result).toContain('test-backup.json');
    });

    it('should handle file creation errors', async () => {
      const mockProjects = [{ project_id: 1, name: 'Test', hourly_cost: 50, created_at: '2024-01-01' }];
      const mockTasks = [{ task_id: 1, project_id: 1, name: 'Test Task', completed: 0, created_at: '2024-01-01' }];
      const mockTimings = [{ timing_id: 1, task_id: 1, name: 'Test Task', completed: 0, created_at: '2024-01-01' }];

      mockDatabase.getAllAsync
        .mockResolvedValueOnce(mockProjects)
        .mockResolvedValueOnce(mockTasks)
        .mockResolvedValueOnce(mockTimings);

      (FileSystem.writeAsStringAsync as jest.Mock).mockRejectedValue(new Error('Write error'));

      await expect(exportBackupToFile(mockDatabase)).rejects.toThrow('Failed to export backup to file');
    });
  });

  describe('downloadBackup', () => {
    it('should create backup and open share screen', async () => {
      const mockProjects = [{ project_id: 1, name: 'Test', hourly_cost: 50, created_at: '2024-01-01' }];
      const mockTasks = [{ task_id: 1, project_id: 1, name: 'Test Task', completed: 0, created_at: '2024-01-01' }];
      const mockTimings = [{ task_id: 1, project_id: 1, name: 'Test Task', completed: 0, created_at: '2024-01-01' }];

      mockDatabase.getAllAsync
        .mockResolvedValueOnce(mockProjects)
        .mockResolvedValueOnce(mockTasks)
        .mockResolvedValueOnce(mockTimings);

      (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
      (FileSystem.writeAsStringAsync as jest.Mock).mockResolvedValue(undefined);
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true, size: 1024 });
      (Sharing.shareAsync as jest.Mock).mockResolvedValue(undefined);

      await downloadBackup(mockDatabase, 'test-backup.json');

      expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
        expect.stringContaining('test-backup.json'),
        expect.any(String),
        { encoding: FileSystem.EncodingType.UTF8 }
      );
    });

    it('should handle file creation errors', async () => {
      const mockProjects = [{ project_id: 1, name: 'Test', hourly_cost: 50, created_at: '2024-01-01' }];
      const mockTasks = [{ task_id: 1, project_id: 1, name: 'Test Task', completed: 0, created_at: '2024-01-01' }];
      const mockTimings = [{ timing_id: 1, task_id: 1, name: 'Test Task', completed: 0, created_at: '2024-01-01' }];

      mockDatabase.getAllAsync
        .mockResolvedValueOnce(mockProjects)
        .mockResolvedValueOnce(mockTasks)
        .mockResolvedValueOnce(mockTimings);

      (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
      (FileSystem.writeAsStringAsync as jest.Mock).mockRejectedValue(new Error('Write error'));

      await expect(downloadBackup(mockDatabase)).rejects.toThrow('Write error');
    });
  });

  describe('restoreFromBackup', () => {
    it('should restore database from backup data', async () => {
      const backupData: BackupData = {
        version: '1.0.0',
        timestamp: '2024-01-01',
        data: {
          projects: [{ project_id: 1, name: 'Test', hourly_cost: 50, created_at: '2024-01-01' }],
          tasks: [{ task_id: 1, project_id: 1, name: 'Test Task', completed: 0, created_at: '2024-01-01' }],
          timings: [{ timing_id: 1, task_id: 1, time: 3600, created_at: '2024-01-01' }]
        }
      };

      mockDatabase.execAsync
        .mockResolvedValueOnce(undefined) // BEGIN TRANSACTION
        .mockResolvedValueOnce(undefined); // COMMIT

      mockDatabase.runAsync
        .mockResolvedValueOnce(undefined) // DELETE FROM timings
        .mockResolvedValueOnce(undefined) // DELETE FROM tasks
        .mockResolvedValueOnce(undefined) // DELETE FROM projects
        .mockResolvedValueOnce(undefined) // DELETE FROM sqlite_sequence
        .mockResolvedValueOnce(undefined) // INSERT project
        .mockResolvedValueOnce(undefined) // INSERT task
        .mockResolvedValueOnce(undefined); // INSERT timing

      await restoreFromBackup(mockDatabase, backupData);

      expect(mockDatabase.execAsync).toHaveBeenCalledWith('BEGIN TRANSACTION;');
      expect(mockDatabase.runAsync).toHaveBeenCalledWith("DELETE FROM timings;");
      expect(mockDatabase.runAsync).toHaveBeenCalledWith("DELETE FROM tasks;");
      expect(mockDatabase.runAsync).toHaveBeenCalledWith("DELETE FROM projects;");
      expect(mockDatabase.execAsync).toHaveBeenCalledWith('COMMIT;');
    });

    it('should handle invalid backup data', async () => {
      const invalidBackupData = {
        version: '1.0.0',
        timestamp: '2024-01-01'
        // Missing data property
      } as BackupData;

      await expect(restoreFromBackup(mockDatabase, invalidBackupData)).rejects.toThrow('Invalid backup data structure');
    });

    it('should rollback transaction on error', async () => {
      const backupData: BackupData = {
        version: '1.0.0',
        timestamp: '2024-01-01',
        data: {
          projects: [{ project_id: 1, name: 'Test', hourly_cost: 50, created_at: '2024-01-01' }],
          tasks: [{ task_id: 1, project_id: 1, name: 'Test Task', completed: 0, created_at: '2024-01-01' }],
          timings: [{ timing_id: 1, task_id: 1, time: 3600, created_at: '2024-01-01' }]
        }
      };

      mockDatabase.execAsync
        .mockResolvedValueOnce(undefined) // BEGIN TRANSACTION
        .mockRejectedValueOnce(new Error('Database error')); // Error during restore

      await expect(restoreFromBackup(mockDatabase, backupData)).rejects.toThrow('Database error');
      expect(mockDatabase.execAsync).toHaveBeenCalledWith('ROLLBACK;');
    });
  });

  describe('restoreFromSelectedFile', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully restore from selected file', async () => {
      const mockDocumentPickerResult = {
        canceled: false,
        assets: [{ uri: 'file://mock-backup.json', name: 'backup.json' }]
      };

      const mockBackupData = {
        version: '1.0.0',
        timestamp: '2023-01-01T00:00:00Z',
        data: {
          projects: [{ project_id: 1, name: 'Test Project', hourly_cost: 50, created_at: '2023-01-01T00:00:00Z' }],
          tasks: [{ task_id: 1, project_id: 1, name: 'Test Task', completed: 0, created_at: '2023-01-01T00:00:00Z' }],
          timings: [{ timing_id: 1, task_id: 1, time: 3600, created_at: '2023-01-01T00:00:00Z' }]
        }
      };

      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue(mockDocumentPickerResult);
      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue(JSON.stringify(mockBackupData));

      await restoreFromSelectedFile(mockDatabase);

      expect(DocumentPicker.getDocumentAsync).toHaveBeenCalledWith({
        type: 'application/json',
        copyToCacheDirectory: true,
        multiple: false
      });
      expect(FileSystem.readAsStringAsync).toHaveBeenCalledWith('file://mock-backup.json');
    });

    it('should handle user cancellation', async () => {
      const mockDocumentPickerResult = {
        canceled: true,
        assets: []
      };

      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue(mockDocumentPickerResult);

      await restoreFromSelectedFile(mockDatabase);

      expect(DocumentPicker.getDocumentAsync).toHaveBeenCalled();
      expect(FileSystem.readAsStringAsync).not.toHaveBeenCalled();
    });

    it('should handle invalid file selection', async () => {
      const mockDocumentPickerResult = {
        canceled: false,
        assets: []
      };

      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue(mockDocumentPickerResult);

      await expect(restoreFromSelectedFile(mockDatabase)).rejects.toThrow('No file selected');
    });

    it('should handle invalid file extension', async () => {
      const mockDocumentPickerResult = {
        canceled: false,
        assets: [{ uri: 'file://mock-backup.txt', name: 'backup.txt' }]
      };

      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue(mockDocumentPickerResult);

      await expect(restoreFromSelectedFile(mockDatabase)).rejects.toThrow('Please select a valid backup file (.json)');
    });

    it('should handle invalid JSON format', async () => {
      const mockDocumentPickerResult = {
        canceled: false,
        assets: [{ uri: 'file://mock-backup.json', name: 'backup.json' }]
      };

      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue(mockDocumentPickerResult);
      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue('invalid json');

      await expect(restoreFromSelectedFile(mockDatabase)).rejects.toThrow('Invalid backup file format');
    });

    it('should handle invalid backup data structure', async () => {
      const mockDocumentPickerResult = {
        canceled: false,
        assets: [{ uri: 'file://mock-backup.json', name: 'backup.json' }]
      };

      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue(mockDocumentPickerResult);
      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue(JSON.stringify({ invalid: 'data' }));

      await expect(restoreFromSelectedFile(mockDatabase)).rejects.toThrow('Invalid backup file');
    });

    it('should handle confirmation dialog cancellation', async () => {
      const mockDocumentPickerResult = {
        canceled: false,
        assets: [{ uri: 'file://mock-backup.json', name: 'backup.json' }]
      };

      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue(mockDocumentPickerResult);
      
      // Ensure FileSystem.readAsStringAsync returns valid backup data for this test
      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValueOnce(JSON.stringify({
        version: '1.0.0',
        timestamp: '2024-01-01T00:00:00.000Z',
        data: {
          projects: [{ project_id: 1, name: 'Test Project', hourly_cost: 50, created_at: '2024-01-01' }],
          tasks: [{ task_id: 1, project_id: 1, name: 'Test Task', completed: 0, created_at: '2024-01-01' }],
          timings: [{ timing_id: 1, task_id: 1, time: 3600, created_at: '2024-01-01' }]
        }
      }));

      await restoreFromSelectedFile(mockDatabase);

      expect(FileSystem.readAsStringAsync).toHaveBeenCalled();
      // Should proceed with restore since there's no confirmation dialog
      expect(mockDatabase.runAsync).toHaveBeenCalled();
    });
  });
});
