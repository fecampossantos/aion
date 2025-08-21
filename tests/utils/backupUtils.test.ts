import { SQLiteDatabase } from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';
import {
  createBackup,
  exportBackupToFile,
  downloadBackup,
  restoreFromBackup,
  restoreFromSelectedFile,
  BackupData
} from '../../utils/backupUtils';

// Mock react-native Alert
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn()
  }
}));

// Mock SQLite database
const mockDatabase = {
  getAllAsync: jest.fn(),
  execAsync: jest.fn(),
  runAsync: jest.fn()
} as unknown as SQLiteDatabase;

describe('backupUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createBackup', () => {
    it('should create backup data from database', async () => {
      const mockProjects = [
        { project_id: 1, name: 'Test Project', hourly_cost: 50, created_at: '2024-01-01' }
      ];
      const mockTasks = [
        { task_id: 1, project_id: 1, name: 'Test Task', completed: 0, created_at: '2024-01-01' }
      ];
      const mockTimings = [
        { timing_id: 1, task_id: 1, time: 3600, created_at: '2024-01-01' }
      ];

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

    it('should handle database errors', async () => {
      mockDatabase.getAllAsync.mockRejectedValue(new Error('Database error'));

      await expect(createBackup(mockDatabase)).rejects.toThrow('Failed to create backup');
    });
  });

  describe('exportBackupToFile', () => {
    it('should export backup to file in documents directory', async () => {
      const mockProjects = [{ project_id: 1, name: 'Test', hourly_cost: 50, created_at: '2024-01-01' }];
      const mockTasks = [{ task_id: 1, project_id: 1, name: 'Test Task', completed: 0, created_at: '2024-01-01' }];
      const mockTimings = [{ timing_id: 1, task_id: 1, time: 3600, created_at: '2024-01-01' }];

      mockDatabase.getAllAsync
        .mockResolvedValueOnce(mockProjects)
        .mockResolvedValueOnce(mockTasks)
        .mockResolvedValueOnce(mockTimings);

      // FileSystem mocks are handled in jest.setup.js

      const result = await exportBackupToFile(mockDatabase, 'test-backup.json');

      expect(result).toContain('test-backup.json');
      expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
        expect.stringContaining('test-backup.json'),
        expect.any(String),
        { encoding: FileSystem.EncodingType.UTF8 }
      );
    });

    it('should generate timestamped filename when no filename provided', async () => {
      const mockProjects = [{ project_id: 1, name: 'Test', hourly_cost: 50, created_at: '2024-01-01' }];
      const mockTasks = [{ task_id: 1, project_id: 1, name: 'Test Task', completed: 0, created_at: '2024-01-01' }];
      const mockTimings = [{ timing_id: 1, task_id: 1, time: 3600, created_at: '2024-01-01' }];

      mockDatabase.getAllAsync
        .mockResolvedValueOnce(mockProjects)
        .mockResolvedValueOnce(mockTasks)
        .mockResolvedValueOnce(mockTimings);

      // FileSystem mocks are handled in jest.setup.js

      const result = await exportBackupToFile(mockDatabase);

      expect(result).toContain('aion-backup-');
      expect(result).toContain('.json');
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

      // FileSystem and Sharing mocks are handled in jest.setup.js

      await downloadBackup(mockDatabase, 'test-backup.json');

      expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
        expect.stringContaining('test-backup.json'),
        expect.any(String),
        { encoding: FileSystem.EncodingType.UTF8 }
      );
      expect(Alert.alert).toHaveBeenCalledWith(
        'Backup Created',
        expect.stringContaining('test-backup.json'),
        expect.any(Array)
      );
    });



    it('should handle file creation errors', async () => {
      const mockProjects = [{ project_id: 1, name: 'Test', hourly_cost: 50, created_at: '2024-01-01' }];
      const mockTasks = [{ task_id: 1, project_id: 1, name: 'Test Task', completed: 0, created_at: '2024-01-01' }];
      const mockTimings = [{ timing_id: 1, task_id: 1, time: 3600, created_at: '2024-01-01' }];

      mockDatabase.getAllAsync
        .mockResolvedValueOnce(mockProjects)
        .mockResolvedValueOnce(mockTasks)
        .mockResolvedValueOnce(mockTimings);

      (FileSystem.writeAsStringAsync as jest.Mock).mockRejectedValue(new Error('Write error'));

      await expect(downloadBackup(mockDatabase)).rejects.toThrow('Write error');
      expect(Alert.alert).toHaveBeenCalledWith(
        'Backup Failed',
        'Failed to create backup: Write error',
        expect.any(Array)
      );
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
          tasks: [],
          timings: []
        }
      };

      mockDatabase.execAsync
        .mockResolvedValueOnce(undefined) // BEGIN TRANSACTION
        .mockResolvedValueOnce(undefined); // ROLLBACK

      mockDatabase.runAsync
        .mockResolvedValueOnce(undefined) // DELETE FROM timings
        .mockResolvedValueOnce(undefined) // DELETE FROM tasks
        .mockResolvedValueOnce(undefined) // DELETE FROM projects
        .mockRejectedValueOnce(new Error('Database error')); // DELETE FROM sqlite_sequence

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

      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue(mockDocumentPickerResult);
      (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
        // Simulate user clicking "Restore"
        if (title === 'Confirm Restore' && buttons && buttons[1]) {
          buttons[1].onPress();
        }
      });

      await restoreFromSelectedFile(mockDatabase);

      expect(DocumentPicker.getDocumentAsync).toHaveBeenCalledWith({
        type: 'application/json',
        copyToCacheDirectory: true,
        multiple: false
      });
      expect(FileSystem.readAsStringAsync).toHaveBeenCalledWith('file://mock-backup.json');
      expect(Alert.alert).toHaveBeenCalledWith(
        'Restore Complete',
        expect.stringContaining('successfully restored'),
        expect.any(Array)
      );
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
      expect(Alert.alert).not.toHaveBeenCalled();
    });

    it('should handle invalid file selection', async () => {
      const mockDocumentPickerResult = {
        canceled: false,
        assets: []
      };

      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue(mockDocumentPickerResult);

      await expect(restoreFromSelectedFile(mockDatabase)).rejects.toThrow('No file selected');
      expect(Alert.alert).toHaveBeenCalledWith(
        'Restore Failed',
        'Failed to restore from backup: No file selected',
        expect.any(Array)
      );
    });

    it('should handle invalid file extension', async () => {
      const mockDocumentPickerResult = {
        canceled: false,
        assets: [{ uri: 'file://mock-backup.txt', name: 'backup.txt' }]
      };

      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue(mockDocumentPickerResult);

      await expect(restoreFromSelectedFile(mockDatabase)).rejects.toThrow('Please select a valid backup file (.json)');
      expect(Alert.alert).toHaveBeenCalledWith(
        'Restore Failed',
        'Failed to restore from backup: Please select a valid backup file (.json)',
        expect.any(Array)
      );
    });

    it('should handle invalid JSON format', async () => {
      const mockDocumentPickerResult = {
        canceled: false,
        assets: [{ uri: 'file://mock-backup.json', name: 'backup.json' }]
      };

      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue(mockDocumentPickerResult);
      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue('invalid json');

      await expect(restoreFromSelectedFile(mockDatabase)).rejects.toThrow('Invalid backup file format');
      expect(Alert.alert).toHaveBeenCalledWith(
        'Restore Failed',
        'Failed to restore from backup: Invalid backup file format. Please select a valid Aion backup file.',
        expect.any(Array)
      );
    });

    it('should handle invalid backup data structure', async () => {
      const mockDocumentPickerResult = {
        canceled: false,
        assets: [{ uri: 'file://mock-backup.json', name: 'backup.json' }]
      };

      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue(mockDocumentPickerResult);
      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue(JSON.stringify({ invalid: 'data' }));

      await expect(restoreFromSelectedFile(mockDatabase)).rejects.toThrow('Invalid backup file');
      expect(Alert.alert).toHaveBeenCalledWith(
        'Restore Failed',
        'Failed to restore from backup: Invalid backup file. This does not appear to be a valid Aion backup.',
        expect.any(Array)
      );
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
      
      // Mock Alert.alert to track calls and simulate user clicking "Cancel"
      let confirmationCalled = false;
      (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
        if (title === 'Confirm Restore' && buttons && buttons[0]) {
          confirmationCalled = true;
          buttons[0].onPress(); // User clicks "Cancel"
        }
      });

      await restoreFromSelectedFile(mockDatabase);

      expect(FileSystem.readAsStringAsync).toHaveBeenCalled();
      expect(confirmationCalled).toBe(true);
      // Should not proceed with restore after cancellation
      expect(mockDatabase.runAsync).not.toHaveBeenCalled();
      // Should not show success message
      expect(Alert.alert).not.toHaveBeenCalledWith(
        'Restore Complete',
        expect.anything(),
        expect.anything()
      );
    });
  });
});
