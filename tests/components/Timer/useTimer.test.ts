import { renderHook, act } from '@testing-library/react-native';
import { useTimer } from '../../../components/Timer/useTimer';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';

// Mock the expo modules
jest.mock('expo-haptics');
jest.mock('expo-notifications');

describe('useTimer', () => {
  const mockOnInit = jest.fn();
  const mockOnStop = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useTimer({}));

    expect(result.current.isCounting).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.startTime).toBe(null);
    expect(result.current.timer).toEqual({ hours: 0, minutes: 0, seconds: 0 });
  });

  it('should start timer when handleTouch is called for the first time', async () => {
    const { result } = renderHook(() => useTimer({ onInit: mockOnInit }));

    await act(async () => {
      result.current.handleTouch();
    });

    expect(result.current.isCounting).toBe(true);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.startTime).toBeTruthy();
    expect(mockOnInit).toHaveBeenCalledTimes(1);
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
  });

  it('should pause timer when handleTouch is called while counting', async () => {
    const { result } = renderHook(() => useTimer({ onInit: mockOnInit }));

    // Start timer
    await act(async () => {
      result.current.handleTouch();
    });

    // Pause timer
    await act(async () => {
      result.current.handleTouch();
    });

    expect(result.current.isCounting).toBe(true);
    expect(result.current.isPaused).toBe(true);
  });

  it('should resume timer when handleTouch is called while paused', async () => {
    const { result } = renderHook(() => useTimer({ onInit: mockOnInit }));

    // Start timer
    await act(async () => {
      result.current.handleTouch();
    });

    // Pause timer
    await act(async () => {
      result.current.handleTouch();
    });

    // Resume timer
    await act(async () => {
      result.current.handleTouch();
    });

    expect(result.current.isCounting).toBe(true);
    expect(result.current.isPaused).toBe(false);
  });

  it('should not start timer when disabled', async () => {
    const { result } = renderHook(() => useTimer({ disabled: true, onInit: mockOnInit }));

    await act(async () => {
      result.current.handleTouch();
    });

    expect(result.current.isCounting).toBe(false);
    expect(mockOnInit).not.toHaveBeenCalled();
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
  });

  it('should stop timer and call onStop when handleStop is called', async () => {
    const { result } = renderHook(() => useTimer({ onInit: mockOnInit, onStop: mockOnStop }));

    // Start timer
    await act(async () => {
      result.current.handleTouch();
    });

    // Advance timer by 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Stop timer
    await act(async () => {
      result.current.handleStop();
    });

    expect(result.current.isCounting).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(mockOnStop).toHaveBeenCalledWith(5);
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Heavy);
    expect(Notifications.dismissNotificationAsync).toHaveBeenCalled();
  });

  it('should not stop timer when disabled', async () => {
    const { result } = renderHook(() => useTimer({ disabled: true, onStop: mockOnStop }));

    await act(async () => {
      result.current.handleStop();
    });

    expect(mockOnStop).not.toHaveBeenCalled();
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
  });

  it('should not stop timer when not counting', async () => {
    const { result } = renderHook(() => useTimer({ onStop: mockOnStop }));

    await act(async () => {
      result.current.handleStop();
    });

    expect(mockOnStop).not.toHaveBeenCalled();
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
  });

  it('should increment timer every second when counting and not paused', () => {
    const { result } = renderHook(() => useTimer({ onInit: mockOnInit }));

    // Start timer
    act(() => {
      result.current.handleTouch();
    });

    // Advance timer by 1 second
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.timer.seconds).toBe(1);

    // Advance timer by 1 more second
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.timer.seconds).toBe(2);
  });

  it('should not increment timer when paused', () => {
    const { result } = renderHook(() => useTimer({ onInit: mockOnInit }));

    // Start timer
    act(() => {
      result.current.handleTouch();
    });

    // Advance timer by 1 second
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.timer.seconds).toBe(1);

    // Pause timer
    act(() => {
      result.current.handleTouch();
    });

    // Advance timer by 1 more second
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.timer.seconds).toBe(1); // Should not increment when paused
  });

  it('should handle minutes and hours correctly', () => {
    const { result } = renderHook(() => useTimer({ onInit: mockOnInit }));

    // Start timer
    act(() => {
      result.current.handleTouch();
    });

    // Advance timer by 3661 seconds (1 hour, 1 minute, 1 second)
    act(() => {
      jest.advanceTimersByTime(3661000);
    });

    expect(result.current.timer.hours).toBe(1);
    expect(result.current.timer.minutes).toBe(1);
    expect(result.current.timer.seconds).toBe(1);
  });

  it('should format time correctly with getTimeToShow', () => {
    const { result } = renderHook(() => useTimer({ onInit: mockOnInit }));

    // Start timer
    act(() => {
      result.current.handleTouch();
    });

    // Advance timer by 3661 seconds (1 hour, 1 minute, 1 second)
    act(() => {
      jest.advanceTimersByTime(3661000);
    });

    expect(result.current.getTimeToShow()).toBe('01:01:01');
  });

  it('should show custom text when stopped and textToShowWhenStopped is provided', () => {
    const { result } = renderHook(() => useTimer({ onInit: mockOnInit }));

    expect(result.current.getTimeToShow('Custom Text')).toBe('Custom Text');
  });

  it('should return correct icon names based on timer state', () => {
    const { result } = renderHook(() => useTimer({ onInit: mockOnInit }));

    // Initial state
    expect(result.current.getIconName()).toBe('caretright');

    // Start timer
    act(() => {
      result.current.handleTouch();
    });

    expect(result.current.getIconName()).toBe('pause');

    // Pause timer
    act(() => {
      result.current.handleTouch();
    });

    expect(result.current.getIconName()).toBe('caretright');
  });

  it('should reset timer when resetCount is called', () => {
    const { result } = renderHook(() => useTimer({ onInit: mockOnInit }));

    // Start timer
    act(() => {
      result.current.handleTouch();
    });

    // Advance timer by 1 second
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.timer.seconds).toBe(1);

    // Stop timer (which resets it)
    act(() => {
      result.current.handleStop();
    });

    expect(result.current.timer).toEqual({ hours: 0, minutes: 0, seconds: 0 });
    expect(result.current.startTime).toBe(null);
  });

  it('should calculate total seconds correctly', () => {
    const { result } = renderHook(() => useTimer({ onInit: mockOnInit }));

    // Start timer
    act(() => {
      result.current.handleTouch();
    });

    // Advance timer by 3661 seconds (1 hour, 1 minute, 1 second)
    act(() => {
      jest.advanceTimersByTime(3661000);
    });

    // Calculate total seconds manually since getSeconds is not exported
    const totalSeconds = result.current.timer.hours * 3600 + result.current.timer.minutes * 60 + result.current.timer.seconds;
    expect(totalSeconds).toBe(3661);
  });

  it('should format numbers with leading zeros', () => {
    const { result } = renderHook(() => useTimer({ onInit: mockOnInit }));

    // Start timer
    act(() => {
      result.current.handleTouch();
    });

    // Advance timer by 65 seconds (1 minute, 5 seconds)
    act(() => {
      jest.advanceTimersByTime(65000);
    });

    expect(result.current.getTimeToShow()).toBe('00:01:05');
  });

  it('should handle 24-hour overflow correctly', () => {
    const { result } = renderHook(() => useTimer({ onInit: mockOnInit }));

    // Start timer
    act(() => {
      result.current.handleTouch();
    });

    // Advance timer by 25 hours
    act(() => {
      jest.advanceTimersByTime(25 * 60 * 60 * 1000);
    });

    expect(result.current.timer.hours).toBe(1); // Should wrap around to 1 hour
  });

  it('should use custom task name in notification', async () => {
    const { result } = renderHook(() => useTimer({ 
      onInit: mockOnInit, 
      taskName: 'Custom Task' 
    }));

    await act(async () => {
      result.current.handleTouch();
    });

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          title: 'Timer for Custom Task running'
        })
      })
    );
  });

  it('should clean up interval on unmount', () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    
    const { unmount } = renderHook(() => useTimer({ onInit: mockOnInit }));

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
