import { renderHook, act } from '@testing-library/react-native';
import { useTask } from '../../../app/Task/useTask';

// Mock expo-sqlite
const mockDatabase = {
  getAllAsync: jest.fn(),
  runAsync: jest.fn(),
};

jest.mock('expo-sqlite', () => ({
  useSQLiteContext: () => mockDatabase,
}));

// Mock data
const mockTimings = [
  {
    timing_id: 1,
    task_id: 1,
    time: 3600,
    created_at: '2023-01-01T10:00:00Z',
  },
  {
    timing_id: 2,
    task_id: 1,
    time: 7200,
    created_at: '2023-01-01T11:00:00Z',
  },
  {
    timing_id: 3,
    task_id: 1,
    time: 1800,
    created_at: '2023-01-02T09:00:00Z',
  },
];

const mockTaskResult = [{ name: 'Test Task' }];

describe('useTask', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDatabase.getAllAsync
      .mockResolvedValueOnce(mockTaskResult) // First call for task details
      .mockResolvedValueOnce(mockTimings); // Second call for timings
    mockDatabase.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: 3 });
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useTask('1'));

    expect(result.current.timings).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isTimerRunning).toBe(false);
    expect(result.current.taskTitle).toBe('');
    expect(result.current.currentPage).toBe(1);
    expect(result.current.itemsPerPage).toBe(10);
  });

  it('fetches timings and task details on mount', async () => {
    const { result } = renderHook(() => useTask('1'));

    await act(async () => {
      // Wait for the effect to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
      'SELECT name FROM tasks WHERE task_id = ?;',
      '1'
    );
    expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
      'SELECT * FROM timings WHERE task_id = ? ORDER BY created_at DESC;',
      '1'
    );
    expect(result.current.timings).toEqual(mockTimings);
    expect(result.current.taskTitle).toBe('Test Task');
    expect(result.current.isLoading).toBe(false);
  });



  it('handles pagination correctly', async () => {
    const { result } = renderHook(() => useTask('1'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Test pagination with default items per page (10)
    expect(result.current.getTotalPages()).toBe(1);
    expect(result.current.getPaginatedTimings()).toEqual(mockTimings);

    // Test pagination with more items
    const manyTimings = Array.from({ length: 15 }, (_, i) => ({
      timing_id: i + 1,
      task_id: 1,
      time: 3600,
      created_at: `2023-01-${String(i + 1).padStart(2, '0')}T10:00:00Z`,
    }));

    // We can't directly set state in the hook, so let's mock the database to return many timings
    mockDatabase.getAllAsync.mockResolvedValue(manyTimings);
    
    // Re-render the hook with the new data
    const { result: newResult } = renderHook(() => useTask('1'));
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(newResult.current.getTotalPages()).toBe(2);
    expect(newResult.current.getPaginatedTimings()).toHaveLength(10);

    // Test next page
    act(() => {
      newResult.current.goToNextPage();
    });

    expect(newResult.current.currentPage).toBe(2);
    expect(newResult.current.getPaginatedTimings()).toHaveLength(5);

    // Test previous page
    act(() => {
      newResult.current.goToPreviousPage();
    });

    expect(newResult.current.currentPage).toBe(1);

    // Test go to specific page
    act(() => {
      newResult.current.goToPage(2);
    });

    expect(newResult.current.currentPage).toBe(2);
  });



  it('handles edge cases in pagination', async () => {
    const { result } = renderHook(() => useTask('1'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Test going to page 0 (should not change)
    act(() => {
      result.current.goToPage(0);
    });

    expect(result.current.currentPage).toBe(1);

    // Test going to page beyond total pages (should not change)
    act(() => {
      result.current.goToPage(999);
    });

    expect(result.current.currentPage).toBe(1);

    // Test going to previous page when on first page (should not change)
    act(() => {
      result.current.goToPreviousPage();
    });

    expect(result.current.currentPage).toBe(1);

    // For edge cases, we'll test with the default mock data (3 items, so 1 page)
    // Test going to next page when on last page (should not change)
    act(() => {
      result.current.goToNextPage();
    });

    expect(result.current.currentPage).toBe(1); // Should not go beyond total pages
  });

  it('calculates total time correctly', async () => {
    const { result } = renderHook(() => useTask('1'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const totalTime = result.current.calculateTotalTime();
    expect(totalTime).toBe(12600); // 3600 + 7200 + 1800

    const formattedTime = result.current.formatTotalTime(totalTime);
    expect(formattedTime).toBe('3h 30m');
  });

  it('handles timer functionality correctly', async () => {
    const { result } = renderHook(() => useTask('1'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Start timer
    act(() => {
      result.current.onInitTimer();
    });

    expect(result.current.isTimerRunning).toBe(true);

    // Stop timer
    await act(async () => {
      await result.current.onStopTimer(1800);
    });

    expect(result.current.isTimerRunning).toBe(false);
    expect(mockDatabase.runAsync).toHaveBeenCalledWith(
      'INSERT INTO timings (task_id, time) VALUES (?, ?);',
      '1',
      1800
    );
  });

  it('handles delete timing correctly', async () => {
    const { result } = renderHook(() => useTask('1'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.handleDeleteTiming(1);
    });

    expect(mockDatabase.runAsync).toHaveBeenCalledWith(
      'DELETE FROM timings WHERE timing_id = ?;',
      1
    );
  });

  it('handles database errors gracefully', async () => {
    // Clear the previous mock setup and set up error scenario
    jest.clearAllMocks();
    mockDatabase.getAllAsync.mockRejectedValue(new Error('Database error'));

    const { result } = renderHook(() => useTask('1'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.timings).toEqual([]);
    expect(result.current.taskTitle).toBe('');
    expect(result.current.isLoading).toBe(false);
  });
});
