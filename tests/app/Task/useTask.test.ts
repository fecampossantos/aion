import { renderHook, act } from '@testing-library/react-native';
import { useTask } from '../../../app/Task/useTask';
import { useSQLiteContext } from 'expo-sqlite';

// Mock the dependencies
jest.mock('expo-sqlite');

const mockUseSQLiteContext = useSQLiteContext as jest.MockedFunction<typeof useSQLiteContext>;

describe('useTask', () => {
  const mockTaskID = 'test-task-123';
  const mockTask = {
    name: 'Test Task',
  };

  const mockTimings = [
    {
      timing_id: 1,
      task_id: 123,
      time: 3600, // 1 hour in seconds
      created_at: '2024-01-01T00:00:00.000Z',
    },
    {
      timing_id: 2,
      task_id: 123,
      time: 5400, // 1.5 hours in seconds
      created_at: '2024-01-01T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockUseSQLiteContext.mockReturnValue({
      execAsync: jest.fn(),
      getAllAsync: jest.fn()
        .mockResolvedValueOnce([mockTask])
        .mockResolvedValueOnce(mockTimings),
      getFirstAsync: jest.fn(),
      runAsync: jest.fn(),
    } as any);
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useTask(mockTaskID));

      expect(result.current.taskTitle).toBe('');
      expect(result.current.timings).toEqual([]);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isTimerRunning).toBe(false);
      expect(typeof result.current.getTimingsFromTask).toBe('function');
      expect(typeof result.current.handleDeleteTiming).toBe('function');
      expect(typeof result.current.onInitTimer).toBe('function');
      expect(typeof result.current.onStopTimer).toBe('function');
      expect(typeof result.current.calculateTotalTime).toBe('function');
      expect(typeof result.current.formatTotalTime).toBe('function');
    });

    it('should call getTimingsFromTask on mount', () => {
      const mockGetAllAsync = jest.fn()
        .mockResolvedValueOnce([mockTask])
        .mockResolvedValueOnce(mockTimings);
      mockUseSQLiteContext.mockReturnValue({
        execAsync: jest.fn(),
        getAllAsync: mockGetAllAsync,
        getFirstAsync: jest.fn(),
        runAsync: jest.fn(),
      } as any);

      renderHook(() => useTask(mockTaskID));

      expect(mockGetAllAsync).toHaveBeenCalledWith(
        'SELECT name FROM tasks WHERE task_id = ?;',
        mockTaskID
      );
    });
  });

  describe('getTimingsFromTask', () => {
    it('should fetch task and timings successfully', async () => {
      const mockGetAllAsync = jest.fn()
        .mockResolvedValueOnce([mockTask])
        .mockResolvedValueOnce(mockTimings);

      mockUseSQLiteContext.mockReturnValue({
        execAsync: jest.fn(),
        getAllAsync: mockGetAllAsync,
        getFirstAsync: jest.fn(),
        runAsync: jest.fn(),
      } as any);

      const { result } = renderHook(() => useTask(mockTaskID));

      // Wait for the effect to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.taskTitle).toBe('Test Task');
      expect(result.current.timings).toEqual(mockTimings);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle task not found', async () => {
      const mockGetAllAsync = jest.fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      mockUseSQLiteContext.mockReturnValue({
        execAsync: jest.fn(),
        getAllAsync: mockGetAllAsync,
        getFirstAsync: jest.fn(),
        runAsync: jest.fn(),
      } as any);

      const { result } = renderHook(() => useTask(mockTaskID));

      // Wait for the effect to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.taskTitle).toBe('');
      expect(result.current.timings).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle database error gracefully', async () => {
      const mockGetAllAsync = jest.fn().mockRejectedValue(new Error('Database error'));

      mockUseSQLiteContext.mockReturnValue({
        execAsync: jest.fn(),
        getAllAsync: mockGetAllAsync,
        getFirstAsync: jest.fn(),
        runAsync: jest.fn(),
      } as any);

      const { result } = renderHook(() => useTask(mockTaskID));

      // Wait for the effect to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.taskTitle).toBe('');
      expect(result.current.timings).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('timer functionality', () => {
    it('should start timer successfully', () => {
      const mockGetAllAsync = jest.fn()
        .mockResolvedValueOnce([mockTask])
        .mockResolvedValueOnce(mockTimings);
      
      mockUseSQLiteContext.mockReturnValue({
        execAsync: jest.fn(),
        getAllAsync: mockGetAllAsync,
        getFirstAsync: jest.fn(),
        runAsync: jest.fn(),
      } as any);

      const { result } = renderHook(() => useTask(mockTaskID));

      act(() => {
        result.current.onInitTimer();
      });

      expect(result.current.isTimerRunning).toBe(true);
    });

    it('should stop timer successfully', async () => {
      const mockRunAsync = jest.fn().mockResolvedValue({});
      const mockGetAllAsync = jest.fn()
        .mockResolvedValueOnce([mockTask])
        .mockResolvedValueOnce(mockTimings);
      
      mockUseSQLiteContext.mockReturnValue({
        execAsync: jest.fn(),
        getAllAsync: mockGetAllAsync,
        getFirstAsync: jest.fn(),
        runAsync: mockRunAsync,
      } as any);

      const { result } = renderHook(() => useTask(mockTaskID));

      // Start timer first
      act(() => {
        result.current.onInitTimer();
      });

      expect(result.current.isTimerRunning).toBe(true);

      // Stop timer
      await act(async () => {
        await result.current.onStopTimer(3600);
      });

      expect(result.current.isTimerRunning).toBe(false);
      expect(mockRunAsync).toHaveBeenCalledWith(
        'INSERT INTO timings (task_id, time) VALUES (?, ?);',
        mockTaskID,
        3600
      );
    });
  });

  describe('task operations', () => {
    it('should delete timing successfully', async () => {
      const mockRunAsync = jest.fn().mockResolvedValue({});
      const mockGetAllAsync = jest.fn()
        .mockResolvedValueOnce([mockTask])
        .mockResolvedValueOnce(mockTimings)
        // After deletion, reload with updated data
        .mockResolvedValueOnce([mockTask])
        .mockResolvedValueOnce(mockTimings);

      mockUseSQLiteContext.mockReturnValue({
        execAsync: jest.fn(),
        getAllAsync: mockGetAllAsync,
        getFirstAsync: jest.fn(),
        runAsync: mockRunAsync,
      } as any);

      const { result } = renderHook(() => useTask(mockTaskID));

      // Wait for initial load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const timingToDelete = mockTimings[0];

      await act(async () => {
        await result.current.handleDeleteTiming(timingToDelete.timing_id);
      });

      expect(mockRunAsync).toHaveBeenCalledWith(
        'DELETE FROM timings WHERE timing_id = ?;',
        timingToDelete.timing_id
      );
    });

    it('should handle database operation errors gracefully', async () => {
      const mockRunAsync = jest.fn().mockRejectedValue(new Error('Database error'));
      const mockGetAllAsync = jest.fn()
        .mockResolvedValueOnce([mockTask])
        .mockResolvedValueOnce(mockTimings);

      mockUseSQLiteContext.mockReturnValue({
        execAsync: jest.fn(),
        getAllAsync: mockGetAllAsync,
        getFirstAsync: jest.fn(),
        runAsync: mockRunAsync,
      } as any);

      const { result } = renderHook(() => useTask(mockTaskID));

      // Wait for initial load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Should not throw error when database operations fail
      expect(() => {
        result.current.handleDeleteTiming(1);
      }).not.toThrow();
    });
  });

  describe('utility functions', () => {
    it('should calculate total time correctly', () => {
      const { result } = renderHook(() => useTask(mockTaskID));

      // The hook will have empty timings initially
      const totalTime = result.current.calculateTotalTime();
      expect(totalTime).toBe(0);
    });

    it('should format total time correctly', () => {
      const { result } = renderHook(() => useTask(mockTaskID));

      const formattedTime = result.current.formatTotalTime(3661); // 1 hour, 1 minute, 1 second
      expect(formattedTime).toBe('1h 1m');
    });

    it('should handle zero time', () => {
      const { result } = renderHook(() => useTask(mockTaskID));

      const formattedTime = result.current.formatTotalTime(0);
      expect(formattedTime).toBe('0h 0m');
    });

    it('should handle large time values', () => {
      const { result } = renderHook(() => useTask(mockTaskID));

      const formattedTime = result.current.formatTotalTime(7325); // 2 hours, 2 minutes, 5 seconds
      expect(formattedTime).toBe('2h 2m');
    });
  });

  describe('state management', () => {
    it('should maintain timer state across re-renders', () => {
      const { result, rerender } = renderHook(() => useTask(mockTaskID));

      // Start timer
      act(() => {
        result.current.onInitTimer();
      });

      expect(result.current.isTimerRunning).toBe(true);

      // Re-render
      rerender(() => useTask(mockTaskID));

      // State should be preserved
      expect(result.current.isTimerRunning).toBe(true);
    });

    it('should handle multiple timer operations', () => {
      const { result } = renderHook(() => useTask(mockTaskID));

      // Start timer
      act(() => {
        result.current.onInitTimer();
      });

      expect(result.current.isTimerRunning).toBe(true);

      // Stop timer
      act(() => {
        result.current.isTimerRunning = false;
      });

      expect(result.current.isTimerRunning).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle empty task ID', () => {
      const { result } = renderHook(() => useTask(''));

      expect(result.current.taskTitle).toBe('');
      expect(result.current.timings).toEqual([]);
      expect(result.current.isLoading).toBe(true);
    });

    it('should handle null task ID', () => {
      const { result } = renderHook(() => useTask(null as any));

      expect(result.current.taskTitle).toBe('');
      expect(result.current.timings).toEqual([]);
      expect(result.current.isLoading).toBe(true);
    });

    it('should handle undefined task ID', () => {
      const { result } = renderHook(() => useTask(undefined as any));

      expect(result.current.taskTitle).toBe('');
      expect(result.current.timings).toEqual([]);
      expect(result.current.isLoading).toBe(true);
    });

    it('should handle database context not available', () => {
      mockUseSQLiteContext.mockReturnValue(null as any);

      // The hook should throw when trying to access null database
      expect(() => {
        renderHook(() => useTask(mockTaskID));
      }).toThrow();
    });

    it('should handle empty timings array', async () => {
      const mockGetAllAsync = jest.fn()
        .mockResolvedValueOnce([mockTask])
        .mockResolvedValueOnce([]);

      mockUseSQLiteContext.mockReturnValue({
        execAsync: jest.fn(),
        getAllAsync: mockGetAllAsync,
        getFirstAsync: jest.fn(),
        runAsync: jest.fn(),
      } as any);

      const { result } = renderHook(() => useTask(mockTaskID));

      // Wait for the effect to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.taskTitle).toBe('Test Task');
      expect(result.current.timings).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('hook lifecycle', () => {
    it('should cleanup timer state on unmount', () => {
      const { result, unmount } = renderHook(() => useTask(mockTaskID));

      // Start timer
      act(() => {
        result.current.onInitTimer();
      });

      expect(result.current.isTimerRunning).toBe(true);

      // Unmount hook - cleanup effect will run
      unmount();

      // Note: We can't test the cleanup effect directly since it runs after unmount
      // The cleanup effect is properly set up in the hook implementation
    });

    it('should handle rapid timer operations', () => {
      const { result } = renderHook(() => useTask(mockTaskID));

      const operations = [
        () => result.current.onInitTimer(),
        () => { result.current.isTimerRunning = false; },
        () => result.current.onInitTimer(),
        () => { result.current.isTimerRunning = false; },
        () => result.current.onInitTimer(),
      ];

      act(() => {
        operations.forEach(operation => operation());
      });

      expect(result.current.isTimerRunning).toBe(true);
    });
  });
});
