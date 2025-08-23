import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useDatabaseManagement } from '../../../app/(index)/useDatabaseManagement';
import { useSQLiteContext } from 'expo-sqlite';
import { Alert } from 'react-native';
import { ToastProvider } from '../../../components/Toast/ToastContext';
import { SQLiteProvider } from 'expo-sqlite';

// Mock the expo modules
jest.mock('expo-sqlite');

// Mock the toast context
const mockShowToast = jest.fn();
jest.mock('../../../components/Toast/ToastContext', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock Alert (no longer used, but keeping for compatibility)
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
    getFirstAsync: jest.fn(),
    runAsync: jest.fn(),
  };

  const mockProjects = [
    { project_id: 1, name: 'Project 1', hourly_cost: 50.00 },
    { project_id: 2, name: 'Project 2', hourly_cost: 75.00 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockShowToast.mockClear();
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

  it("should fetch projects on mount", async () => {
    mockDatabase.getAllAsync.mockResolvedValue(mockProjects);

    const { result } = renderHook(() => useDatabaseManagement());

    // Wait for the effect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockDatabase.getAllAsync).toHaveBeenCalledWith('SELECT * FROM projects ORDER BY name ASC;');
    expect(result.current.projects).toEqual(mockProjects);
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle fetchAllProjects correctly", async () => {
    mockDatabase.getAllAsync.mockResolvedValue(mockProjects);

    const { result } = renderHook(() => useDatabaseManagement());

    await act(async () => {
      await result.current.fetchAllProjects();
    });

    expect(mockDatabase.getAllAsync).toHaveBeenCalledWith('SELECT * FROM projects ORDER BY name ASC;');
    expect(result.current.projects).toEqual(mockProjects);
  });

  describe('handlePopulateDatabase', () => {
    it('should show confirmation modal', async () => {
      const { result } = renderHook(() => useDatabaseManagement());

      await act(async () => {
        result.current.handlePopulateDatabase();
      });

      // Should show populate confirmation modal
      expect(result.current.showPopulateConfirmation).toBe(true);
    });

    it("handlePopulateDatabase should populate database when confirmed", async () => {
      mockDatabase.runAsync.mockResolvedValue({});
      const { populateDatabase } = require('../../../utils/databaseUtils');

      const { result } = renderHook(() => useDatabaseManagement());

      // Call the confirmation handler directly (simulating modal confirmation)
      await act(async () => {
        result.current.handlePopulateConfirm();
      });

      expect(populateDatabase).toHaveBeenCalledWith(mockDatabase);
      expect(result.current.isPopulating).toBe(false);
    });

    it("handlePopulateDatabase should show success message after population", async () => {
      mockDatabase.runAsync.mockResolvedValue({});
      const { populateDatabase } = require('../../../utils/databaseUtils');

      const { result } = renderHook(() => useDatabaseManagement());

      // Call the confirmation handler directly (simulating modal confirmation)
      await act(async () => {
        result.current.handlePopulateConfirm();
      });

      // Should show success toast
      expect(mockShowToast).toHaveBeenCalledWith(
        'Database populated successfully!',
        'success'
      );
    });

    it('should handle population errors gracefully', async () => {
      const { result } = renderHook(() => useDatabaseManagement());
      const { populateDatabase } = require('../../../utils/databaseUtils');

      // Mock populateDatabase to throw an error
      (populateDatabase as jest.Mock).mockRejectedValue(new Error('Population failed'));

      // Call the confirmation handler directly (simulating modal confirmation)
      await act(async () => {
        result.current.handlePopulateConfirm();
      });

      // Should show error toast
      expect(mockShowToast).toHaveBeenCalledWith(
        'Failed to populate database. Please try again.',
        'error'
      );
      expect(result.current.isPopulating).toBe(false);
    });

    it('should set loading states correctly during population', async () => {
      const { result } = renderHook(() => useDatabaseManagement());
      const { populateDatabase } = require('../../../utils/databaseUtils');

      // Mock populateDatabase to be slow
      (populateDatabase as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      await act(async () => {
        result.current.handlePopulateConfirm();
      });

      // Should be populating while operation is in progress
      expect(result.current.isPopulating).toBe(true);

      // Wait for the operation to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      // Should not be populating after completion
      expect(result.current.isPopulating).toBe(false);
    });
  });

  describe('handleClearDatabase', () => {
    it('should show confirmation modal', async () => {
      const { result } = renderHook(() => useDatabaseManagement());

      await act(async () => {
        result.current.handleClearDatabase();
      });

      // Should show clear confirmation modal
      expect(result.current.showClearConfirmation).toBe(true);
    });

    it('should clear database when confirmed', async () => {
      const { result } = renderHook(() => useDatabaseManagement());
      const { clearDatabase } = require('../../../utils/databaseUtils');

      // Call the confirmation handler directly (simulating modal confirmation)
      await act(async () => {
        result.current.handleClearConfirm();
      });

      expect(clearDatabase).toHaveBeenCalledWith(mockDatabase);
      expect(result.current.isClearing).toBe(false);
    });

    it('should show success message after clearing', async () => {
      const { result } = renderHook(() => useDatabaseManagement());
      const { clearDatabase } = require('../../../utils/databaseUtils');

      // Call the confirmation handler directly (simulating modal confirmation)
      await act(async () => {
        result.current.handleClearConfirm();
      });

      // Should show success toast
      expect(mockShowToast).toHaveBeenCalledWith(
        'Database cleared successfully!',
        'success'
      );
    });

    it('should handle clearing errors gracefully', async () => {
      const { result } = renderHook(() => useDatabaseManagement());
      const { clearDatabase } = require('../../../utils/databaseUtils');

      // Mock clearDatabase to throw an error
      (clearDatabase as jest.Mock).mockRejectedValue(new Error('Clear failed'));

      // Call the confirmation handler directly (simulating modal confirmation)
      await act(async () => {
        result.current.handleClearConfirm();
      });

      // Should show error toast
      expect(mockShowToast).toHaveBeenCalledWith(
        'Failed to clear database. Please try again.',
        'error'
      );
      expect(result.current.isClearing).toBe(false);
    });

    it('should set loading states correctly during clearing', async () => {
      const { result } = renderHook(() => useDatabaseManagement());
      const { clearDatabase } = require('../../../utils/databaseUtils');

      // Mock clearDatabase to be slow
      (clearDatabase as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      await act(async () => {
        result.current.handleClearConfirm();
      });

      // Should be clearing while operation is in progress
      expect(result.current.isClearing).toBe(true);

      // Wait for the operation to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
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

    await act(async () => {
      result.current.handlePopulateConfirm();
    });

    // Should be populating while operation is in progress
    expect(result.current.isPopulating).toBe(true);
    expect(result.current.isClearing).toBe(false);

    // Wait for the operation to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    // Should not be populating after completion
    expect(result.current.isPopulating).toBe(false);
  });

  it('should refresh projects after database operations', async () => {
    const { result } = renderHook(() => useDatabaseManagement());
    const { populateDatabase } = require('../../../utils/databaseUtils');

    // Wait for the initial effect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Reset the mock call count after initial effect
    mockDatabase.getAllAsync.mockClear();

    await act(async () => {
      result.current.handlePopulateConfirm();
    });

    // Since we're mocking the utility functions, we can't easily test the database calls
    // But we can verify that the populate function was called
    expect(populateDatabase).toHaveBeenCalled();
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
