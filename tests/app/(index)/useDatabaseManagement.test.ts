import { renderHook, act } from '@testing-library/react-native';
import { useDatabaseManagement } from '../../../app/(index)/useDatabaseManagement';
import { useSQLiteContext } from 'expo-sqlite';
import { Alert } from 'react-native';

// Mock the expo modules
jest.mock('expo-sqlite');

// Mock Alert
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));


// Mock the utility functions
jest.mock('../../../utils/databaseUtils', () => ({
  populateDatabase: jest.fn(),
  clearDatabase: jest.fn(),
  getDatabaseStats: jest.fn(() => Promise.resolve({ projects: 2, tasks: 10, timings: 100 })),
}));

describe('useDatabaseManagement', () => {
  const mockDatabase = {
    getAllAsync: jest.fn(),
    runAsync: jest.fn(),
  };

  const mockProjects = [
    { project_id: 1, name: 'Project 1', hourly_cost: 50.00 },
    { project_id: 2, name: 'Project 2', hourly_cost: 75.00 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useSQLiteContext as jest.Mock).mockReturnValue(mockDatabase);
    mockDatabase.getAllAsync.mockResolvedValue(mockProjects);
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useDatabaseManagement());

    expect(result.current.projects).toEqual([]);
    expect(result.current.isLoading).toBe(true); // Initially loading while fetching data
    expect(result.current.isPopulating).toBe(false);
    expect(result.current.isClearing).toBe(false);
    expect(typeof result.current.fetchAllProjects).toBe('function');
    expect(typeof result.current.handlePopulateDatabase).toBe('function');
    expect(typeof result.current.handleClearDatabase).toBe('function');
  });

  it('should fetch projects on mount', async () => {
    const { result } = renderHook(() => useDatabaseManagement());

    // Wait for the effect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockDatabase.getAllAsync).toHaveBeenCalledWith('SELECT * FROM projects;');
    expect(result.current.projects).toEqual(mockProjects);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle fetchAllProjects correctly', async () => {
    const { result } = renderHook(() => useDatabaseManagement());

    await act(async () => {
      await result.current.fetchAllProjects();
    });

    expect(mockDatabase.getAllAsync).toHaveBeenCalledWith('SELECT * FROM projects;');
    expect(result.current.projects).toEqual(mockProjects);
  });

  describe('handlePopulateDatabase', () => {
    it('should show confirmation alert', async () => {
      const { result } = renderHook(() => useDatabaseManagement());

      await act(async () => {
        result.current.handlePopulateDatabase();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Populate Database',
        'This will add 2 projects with extensive tasks and 2 months of time tracking data. This may take a few seconds.',
        expect.arrayContaining([
          expect.objectContaining({ text: 'Cancel', style: 'cancel' }),
          expect.objectContaining({ text: 'Populate' }),
        ])
      );
    });

    it('should populate database when confirmed', async () => {
      const { result } = renderHook(() => useDatabaseManagement());
      const { populateDatabase, getDatabaseStats } = require('../../../utils/databaseUtils');

      // Mock Alert.alert to simulate user clicking "Populate"
      (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
        if (buttons && Array.isArray(buttons)) {
          const populateButton = buttons.find((button: any) => button.text === 'Populate');
          if (populateButton && populateButton.onPress) {
            populateButton.onPress();
          }
        }
      });

      await act(async () => {
        result.current.handlePopulateDatabase();
      });

      expect(populateDatabase).toHaveBeenCalledWith(mockDatabase);
      expect(getDatabaseStats).toHaveBeenCalledWith(mockDatabase);
      expect(result.current.isPopulating).toBe(false);
    });

    it('should show success message after population', async () => {
      const { result } = renderHook(() => useDatabaseManagement());
      const { populateDatabase, getDatabaseStats } = require('../../../utils/databaseUtils');

      // Mock Alert.alert to simulate user clicking "Populate"
      (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
        if (buttons && Array.isArray(buttons)) {
          const populateButton = buttons.find((button: any) => button.text === 'Populate');
          if (populateButton && populateButton.onPress) {
            populateButton.onPress();
          }
        }
      });

      await act(async () => {
        result.current.handlePopulateDatabase();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Success!',
        'Database populated successfully!\n\nAdded:\n• 2 projects\n• 10 tasks\n• 100 time entries'
      );
    });

    it('should handle population errors gracefully', async () => {
      const { result } = renderHook(() => useDatabaseManagement());
      const { populateDatabase } = require('../../../utils/databaseUtils');

      // Mock populateDatabase to throw an error
      (populateDatabase as jest.Mock).mockRejectedValue(new Error('Population failed'));

      // Mock Alert.alert to simulate user clicking "Populate"
      (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
        if (buttons && Array.isArray(buttons)) {
          const populateButton = buttons.find((button: any) => button.text === 'Populate');
          if (populateButton && populateButton.onPress) {
            populateButton.onPress();
          }
        }
      });

      await act(async () => {
        result.current.handlePopulateDatabase();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to populate database. Please try again.'
      );
      expect(result.current.isPopulating).toBe(false);
    });

    it('should set loading states correctly during population', async () => {
      const { result } = renderHook(() => useDatabaseManagement());
      const { populateDatabase } = require('../../../utils/databaseUtils');

      // Mock populateDatabase to be slow
      (populateDatabase as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      let populationPromise: Promise<void> | undefined;

      // Mock Alert.alert to capture the promise and simulate user clicking "Populate"
      (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
        if (buttons && Array.isArray(buttons)) {
          const populateButton = buttons.find((button: any) => button.text === 'Populate');
          if (populateButton && populateButton.onPress) {
            populationPromise = populateButton.onPress();
          }
        }
      });

      await act(async () => {
        result.current.handlePopulateDatabase();
        await new Promise(resolve => setTimeout(resolve, 0)); // Allow alert to be called
      });

      // Should be populating while operation is in progress
      expect(result.current.isPopulating).toBe(true);

      await act(async () => {
        if (populationPromise) {
          await populationPromise;
        }
      });

      // Should not be populating after completion
      expect(result.current.isPopulating).toBe(false);
    });
  });

  describe('handleClearDatabase', () => {
    it('should show confirmation alert', async () => {
      const { result } = renderHook(() => useDatabaseManagement());

      await act(async () => {
        result.current.handleClearDatabase();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Clear Database',
        'This will permanently delete ALL projects, tasks, and time tracking data. This action cannot be undone!',
        expect.arrayContaining([
          expect.objectContaining({ text: 'Cancel', style: 'cancel' }),
          expect.objectContaining({ text: 'Clear All', style: 'destructive' }),
        ])
      );
    });

    it('should clear database when confirmed', async () => {
      const { result } = renderHook(() => useDatabaseManagement());
      const { clearDatabase } = require('../../../utils/databaseUtils');

      // Mock Alert.alert to simulate user clicking "Clear All"
      (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
        if (buttons && Array.isArray(buttons)) {
          const clearButton = buttons.find((button: any) => button.text === 'Clear All');
          if (clearButton && clearButton.onPress) {
            clearButton.onPress();
          }
        }
      });

      await act(async () => {
        result.current.handleClearDatabase();
      });

      expect(clearDatabase).toHaveBeenCalledWith(mockDatabase);
      expect(result.current.isClearing).toBe(false);
    });

    it('should show success message after clearing', async () => {
      const { result } = renderHook(() => useDatabaseManagement());
      const { clearDatabase } = require('../../../utils/databaseUtils');

      // Mock Alert.alert to simulate user clicking "Clear All"
      (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
        if (buttons && Array.isArray(buttons)) {
          const clearButton = buttons.find((button: any) => button.text === 'Clear All');
          if (clearButton && clearButton.onPress) {
            clearButton.onPress();
          }
        }
      });

      await act(async () => {
        result.current.handleClearDatabase();
      });

      expect(Alert.alert).toHaveBeenCalledWith('Success!', 'Database cleared successfully!');
    });

    it('should handle clearing errors gracefully', async () => {
      const { result } = renderHook(() => useDatabaseManagement());
      const { clearDatabase } = require('../../../utils/databaseUtils');

      // Mock clearDatabase to throw an error
      (clearDatabase as jest.Mock).mockRejectedValue(new Error('Clear failed'));

      // Mock Alert.alert to simulate user clicking "Clear All"
      (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
        if (buttons && Array.isArray(buttons)) {
          const clearButton = buttons.find((button: any) => button.text === 'Clear All');
          if (clearButton && clearButton.onPress) {
            clearButton.onPress();
          }
        }
      });

      await act(async () => {
        result.current.handleClearDatabase();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to clear database. Please try again.'
      );
      expect(result.current.isClearing).toBe(false);
    });

    it('should set loading states correctly during clearing', async () => {
      const { result } = renderHook(() => useDatabaseManagement());
      const { clearDatabase } = require('../../../utils/databaseUtils');

      // Mock clearDatabase to be slow
      (clearDatabase as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      let clearingPromise: Promise<void> | undefined;

      // Mock Alert.alert to capture the promise and simulate user clicking "Clear All"
      (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
        if (buttons && Array.isArray(buttons)) {
          const clearButton = buttons.find((button: any) => button.text === 'Clear All');
          if (clearButton && clearButton.onPress) {
            clearingPromise = clearButton.onPress();
          }
        }
      });

      await act(async () => {
        result.current.handleClearDatabase();
        await new Promise(resolve => setTimeout(resolve, 0)); // Allow alert to be called
      });

      // Should be clearing while operation is in progress
      expect(result.current.isClearing).toBe(true);

      await act(async () => {
        if (clearingPromise) {
          await clearingPromise;
        }
      });

      // Should not be clearing after completion
      expect(result.current.isClearing).toBe(false);
    });
  });

  it('should disable buttons when operations are in progress', async () => {
    const { result } = renderHook(() => useDatabaseManagement());
    const { populateDatabase } = require('../../../utils/databaseUtils');

    // Mock populateDatabase to be slow
    (populateDatabase as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    let populationPromise: Promise<void> | undefined;

    // Mock Alert.alert to capture the promise and simulate user clicking "Populate"
    (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
      if (buttons && Array.isArray(buttons)) {
        const populateButton = buttons.find((button: any) => button.text === 'Populate');
        if (populateButton && populateButton.onPress) {
          populationPromise = populateButton.onPress();
        }
      }
    });

    await act(async () => {
      result.current.handlePopulateDatabase();
      await new Promise(resolve => setTimeout(resolve, 0)); // Allow alert to be called
    });

    // Should be populating while operation is in progress
    expect(result.current.isPopulating).toBe(true);
    expect(result.current.isClearing).toBe(false);

    await act(async () => {
      if (populationPromise) {
        await populationPromise;
      }
    });

    // Should not be populating after completion
    expect(result.current.isPopulating).toBe(false);
  });

  it('should refresh projects after database operations', async () => {
    const { result } = renderHook(() => useDatabaseManagement());
    const { populateDatabase } = require('../../../utils/databaseUtils');

    let populationPromise: Promise<void> | undefined;

    // Mock Alert.alert to capture the promise and simulate user clicking "Populate"
    (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
      if (buttons && Array.isArray(buttons)) {
        const populateButton = buttons.find((button: any) => button.text === 'Populate');
        if (populateButton && populateButton.onPress) {
          populationPromise = populateButton.onPress();
        }
      }
    });

    await act(async () => {
      result.current.handlePopulateDatabase();
      await new Promise(resolve => setTimeout(resolve, 0)); // Allow alert to be called
    });

    await act(async () => {
      if (populationPromise) {
        await populationPromise;
      }
    });

    // Should call fetchAllProjects after population
    expect(mockDatabase.getAllAsync).toHaveBeenCalledTimes(2); // Once on mount, once after population
  });

  it('should handle database errors gracefully', async () => {
    const { result } = renderHook(() => useDatabaseManagement());

    // Mock database to throw an error
    mockDatabase.getAllAsync.mockRejectedValueOnce(new Error('Database error'));

    await act(async () => {
      try {
        await result.current.fetchAllProjects();
      } catch (error) {
        // Expected to catch the error
      }
    });

    // Should still set loading to false even on error
    expect(result.current.isLoading).toBe(false);
  });
});
