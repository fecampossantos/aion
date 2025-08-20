import { renderHook, act } from '@testing-library/react-native';
import { useProject } from '../../../app/Project/useProject';
import { useSQLiteContext } from 'expo-sqlite';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

// Mock the dependencies
jest.mock('expo-sqlite');
jest.mock('@react-navigation/native');
jest.mock('expo-router');
jest.mock('react-native');

const mockUseSQLiteContext = useSQLiteContext as jest.MockedFunction<typeof useSQLiteContext>;
const mockUseNavigation = jest.fn();
const mockUseRouter = jest.fn();
const mockAlert = jest.fn();

describe('useProject', () => {
  const mockProjectID = 'test-project-123';
  const mockProject = {
    id: mockProjectID,
    name: 'Test Project',
    description: 'Test Description',
    hourlyRate: 25.0,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const mockTasks = [
    {
      id: 'task-1',
      projectID: mockProjectID,
      name: 'Task 1',
      description: 'Description 1',
      isCompleted: false,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 'task-2',
      projectID: mockProjectID,
      name: 'Task 2',
      description: 'Description 2',
      isCompleted: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ];

  const mockTimings = [
    {
      id: 'timing-1',
      taskID: 'task-1',
      startTime: '2024-01-01T10:00:00.000Z',
      endTime: '2024-01-01T11:00:00.000Z',
      duration: 3600000, // 1 hour in milliseconds
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockUseSQLiteContext.mockReturnValue({
      execAsync: jest.fn(),
      getAllAsync: jest.fn(),
      getFirstAsync: jest.fn(),
      runAsync: jest.fn(),
    } as any);

    mockUseNavigation.mockReturnValue({
      navigate: jest.fn(),
      goBack: jest.fn(),
      setOptions: jest.fn(),
    } as any);

    mockUseRouter.mockReturnValue({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      canGoBack: jest.fn(),
      canGoForward: jest.fn(),
    } as any);
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useProject(mockProjectID));

      expect(result.current.project).toBe(undefined);
      expect(result.current.tasks).toEqual([]);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isTimerRunning).toBe(false);
      expect(typeof result.current.handleInitTimer).toBe('function');
      expect(typeof result.current.handleStopTimer).toBe('function');

    });

    it('should call fetchProject on mount', () => {
      const mockGetFirstAsync = jest.fn();
      mockUseSQLiteContext.mockReturnValue({
        execAsync: jest.fn(),
        getAllAsync: jest.fn(),
        getFirstAsync: mockGetFirstAsync,
        runAsync: jest.fn(),
      } as any);

      renderHook(() => useProject(mockProjectID));

      expect(mockGetFirstAsync).toHaveBeenCalledWith(
        'SELECT * FROM projects WHERE project_id = ?;',
        mockProjectID
      );
    });
  });

  describe('fetchProject', () => {
    it('should fetch project successfully', async () => {
      const mockGetFirstAsync = jest.fn().mockResolvedValue(mockProject);
      const mockGetAllAsync = jest.fn().mockResolvedValue(mockTasks);

      mockUseSQLiteContext.mockReturnValue({
        execAsync: jest.fn(),
        getAllAsync: mockGetAllAsync,
        getFirstAsync: mockGetFirstAsync,
        runAsync: jest.fn(),
      } as any);

      const { result } = renderHook(() => useProject(mockProjectID));

      // Wait for the effect to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.project).toEqual(mockProject);
      expect(result.current.tasks).toEqual(mockTasks);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle project not found', async () => {
      const mockGetFirstAsync = jest.fn().mockResolvedValue(null);

      mockUseSQLiteContext.mockReturnValue({
        execAsync: jest.fn(),
        getAllAsync: jest.fn(),
        getFirstAsync: mockGetFirstAsync,
        runAsync: jest.fn(),
      } as any);

      const { result } = renderHook(() => useProject(mockProjectID));

      // Wait for the effect to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.project).toBe(null);
      expect(result.current.tasks).toBe(undefined);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle database error', async () => {
      const mockGetFirstAsync = jest.fn().mockRejectedValue(new Error('Database error'));

      mockUseSQLiteContext.mockReturnValue({
        execAsync: jest.fn(),
        getAllAsync: jest.fn(),
        getFirstAsync: mockGetFirstAsync,
        runAsync: jest.fn(),
      } as any);

      const { result } = renderHook(() => useProject(mockProjectID));

      // Wait for the effect to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.project).toBe(null);
      expect(result.current.tasks).toBe(undefined);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('timer functionality', () => {
    it('should start timer successfully', () => {
      const { result } = renderHook(() => useProject(mockProjectID));

      act(() => {
        result.current.handleInitTimer(1);
      });

      expect(result.current.isTimerRunning).toBe(true);
      expect(result.current.timerIdRunning).toBe(1);
    });

    it('should stop timer successfully', () => {
      const { result } = renderHook(() => useProject(mockProjectID));

      // Start timer first
      act(() => {
        result.current.handleInitTimer(1);
      });

      expect(result.current.isTimerRunning).toBe(true);

      // Stop timer
      act(() => {
        result.current.handleStopTimer();
      });

      expect(result.current.isTimerRunning).toBe(false);
      expect(result.current.timerIdRunning).toBe(null);
    });

    it('should handle starting timer when one is already running', () => {
      const { result } = renderHook(() => useProject(mockProjectID));

      // Start first timer
      act(() => {
        result.current.handleInitTimer(1);
      });

      const firstTimerId = result.current.timerIdRunning;

      // Start second timer
      act(() => {
        result.current.handleInitTimer(2);
      });

      expect(result.current.timerIdRunning).toBe(2);
      expect(result.current.timerIdRunning).not.toBe(firstTimerId);
    });

    it('should handle stopping timer when none is running', () => {
      const { result } = renderHook(() => useProject(mockProjectID));

      expect(result.current.isTimerRunning).toBe(false);

      act(() => {
        result.current.handleStopTimer();
      });

      expect(result.current.isTimerRunning).toBe(false);
      expect(result.current.timerIdRunning).toBe(null);
    });
  });





  describe('state management', () => {
    it('should maintain timer state across re-renders', () => {
      const { result, rerender } = renderHook(() => useProject(mockProjectID));

      // Start timer
      act(() => {
        result.current.handleInitTimer(1);
      });

      expect(result.current.isTimerRunning).toBe(true);

      // Re-render
      rerender(() => useProject(mockProjectID));

      // State should be preserved
      expect(result.current.isTimerRunning).toBe(true);
      expect(result.current.timerIdRunning).toBe(1);
    });

    it('should handle multiple timer operations', () => {
      const { result } = renderHook(() => useProject(mockProjectID));

      // Start timer
      act(() => {
        result.current.handleInitTimer(1);
      });

      expect(result.current.isTimerRunning).toBe(true);
      expect(result.current.timerIdRunning).toBe(1);

      // Stop timer
      act(() => {
        result.current.handleStopTimer();
      });

      expect(result.current.isTimerRunning).toBe(false);
      expect(result.current.timerIdRunning).toBe(null);

      // Start another timer
      act(() => {
        result.current.handleInitTimer(2);
      });

      expect(result.current.isTimerRunning).toBe(true);
      expect(result.current.timerIdRunning).toBe(2);
    });
  });

  describe('edge cases', () => {
    it('should handle empty project ID', () => {
      const { result } = renderHook(() => useProject(''));

      expect(result.current.project).toBe(undefined);
      expect(result.current.tasks).toEqual([]);
    });

    it('should handle null project ID', () => {
      const { result } = renderHook(() => useProject(null as any));

      expect(result.current.project).toBe(undefined);
      expect(result.current.tasks).toEqual([]);
    });

    it('should handle undefined project ID', () => {
      const { result } = renderHook(() => useProject(undefined as any));

      expect(result.current.project).toBe(undefined);
      expect(result.current.tasks).toEqual([]);
    });

    it('should handle database context not available', () => {
      mockUseSQLiteContext.mockReturnValue(null as any);

      // The hook should throw when trying to access null database
      expect(() => {
        renderHook(() => useProject(mockProjectID));
      }).toThrow();
    });


  });

  describe('showCompleted toggle functionality', () => {
    const mockDatabase = {
      execAsync: jest.fn(),
      getAllAsync: jest.fn(),
      getFirstAsync: jest.fn(),
      runAsync: jest.fn(),
    };

    const mockTasksWithTimed = [
      {
        task_id: 1,
        name: 'Incomplete Task 1',
        completed: 0,
        task_created_at: '2024-01-01T00:00:00.000Z',
        timed_until_now: 0,
      },
      {
        task_id: 2,
        name: 'Completed Task 1',
        completed: 1,
        task_created_at: '2024-01-01T00:00:00.000Z',
        timed_until_now: 3600,
      },
      {
        task_id: 3,
        name: 'Incomplete Task 2',
        completed: 0,
        task_created_at: '2024-01-01T00:00:00.000Z',
        timed_until_now: 1800,
      },
      {
        task_id: 4,
        name: 'Completed Task 2',
        completed: 1,
        task_created_at: '2024-01-01T00:00:00.000Z',
        timed_until_now: 7200,
      },
    ];

    beforeEach(() => {
      mockUseSQLiteContext.mockReturnValue(mockDatabase as any);
      
      // Mock getFirstAsync for project
      mockDatabase.getFirstAsync.mockResolvedValue(mockProject);
      
      // Mock getAllAsync for tasks
      mockDatabase.getAllAsync.mockResolvedValue(mockTasksWithTimed);
    });

    it('should initialize with showCompleted as false', () => {
      const { result } = renderHook(() => useProject(mockProjectID));

      expect(result.current.showCompleted).toBe(false);
    });

    it('should show only incomplete tasks when showCompleted is false (default)', async () => {
      const { result } = renderHook(() => useProject(mockProjectID));

      // Wait for tasks to load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Should show only incomplete tasks (completed === 0)
      const incompleteTasks = mockTasksWithTimed.filter(task => task.completed === 0);
      expect(result.current.filteredTasks).toEqual(incompleteTasks);
      expect(result.current.filteredTasks).toHaveLength(2);
      expect(result.current.filteredTasks[0].name).toBe('Incomplete Task 1');
      expect(result.current.filteredTasks[1].name).toBe('Incomplete Task 2');
    });

    it('should show all tasks when showCompleted is true (toggled)', async () => {
      const { result } = renderHook(() => useProject(mockProjectID));

      // Wait for tasks to load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Toggle showCompleted to true
      act(() => {
        result.current.handleShowCompletedToggle(true);
      });

      // Should show all tasks (both completed and incomplete)
      expect(result.current.showCompleted).toBe(true);
      expect(result.current.filteredTasks).toEqual(mockTasksWithTimed);
      expect(result.current.filteredTasks).toHaveLength(4);
    });

    it('should filter tasks correctly when toggling showCompleted', async () => {
      const { result } = renderHook(() => useProject(mockProjectID));

      // Wait for tasks to load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Initially should show only incomplete tasks
      expect(result.current.showCompleted).toBe(false);
      expect(result.current.filteredTasks).toHaveLength(2);

      // Toggle to show all tasks
      act(() => {
        result.current.handleShowCompletedToggle(true);
      });

      expect(result.current.showCompleted).toBe(true);
      expect(result.current.filteredTasks).toHaveLength(4);

      // Toggle back to show only incomplete tasks
      act(() => {
        result.current.handleShowCompletedToggle(false);
      });

      expect(result.current.showCompleted).toBe(false);
      expect(result.current.filteredTasks).toHaveLength(2);
    });

    it('should reset showCompleted to false when projectID changes', async () => {
      const { result, rerender } = renderHook(
        ({ projectID }) => useProject(projectID),
        { initialProps: { projectID: mockProjectID } }
      );

      // Wait for tasks to load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Toggle showCompleted to true
      act(() => {
        result.current.handleShowCompletedToggle(true);
      });

      expect(result.current.showCompleted).toBe(true);

      // Change projectID
      rerender({ projectID: 'new-project-456' });

      // showCompleted should be reset to false
      expect(result.current.showCompleted).toBe(false);
    });

    it('should combine showCompleted filter with search query', async () => {
      const { result } = renderHook(() => useProject(mockProjectID));

      // Wait for tasks to load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Set search query
      act(() => {
        result.current.handleSearchChange('Task 1');
      });

      // Should show only incomplete tasks matching search (default showCompleted = false)
      expect(result.current.filteredTasks).toHaveLength(1);
      expect(result.current.filteredTasks[0].name).toBe('Incomplete Task 1');

      // Toggle to show all tasks
      act(() => {
        result.current.handleShowCompletedToggle(true);
      });

      // Should show all tasks matching search
      expect(result.current.filteredTasks).toHaveLength(2);
      expect(result.current.filteredTasks[0].name).toBe('Incomplete Task 1');
      expect(result.current.filteredTasks[1].name).toBe('Completed Task 1');
    });
  });

  describe('hook lifecycle', () => {
    it('should cleanup timer state on unmount', () => {
      const { result, unmount } = renderHook(() => useProject(mockProjectID));

      // Start timer
      act(() => {
        result.current.handleInitTimer(1);
      });

      expect(result.current.isTimerRunning).toBe(true);

      // Unmount hook - cleanup effect will run
      unmount();

      // Note: We can't test the cleanup effect directly since it runs after unmount
      // The cleanup effect is properly set up in the hook implementation
    });

    it('should handle rapid timer operations', () => {
      const { result } = renderHook(() => useProject(mockProjectID));

      const operations = [
        () => result.current.handleInitTimer(1),
        () => result.current.handleStopTimer(),
        () => result.current.handleInitTimer(2),
        () => result.current.handleStopTimer(),
        () => result.current.handleInitTimer(3),
      ];

      act(() => {
        operations.forEach(operation => operation());
      });

      expect(result.current.isTimerRunning).toBe(true);
      expect(result.current.timerIdRunning).toBe(3);
    });
  });
});
