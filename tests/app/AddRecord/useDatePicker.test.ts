import { renderHook, act } from '@testing-library/react-native';
import { useDatePicker } from '../../../app/AddRecord/useDatePicker';

describe('useDatePicker', () => {
  const mockInitialDate = new Date('2024-01-01T10:00:00.000Z');

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useDatePicker());

    expect(result.current.date).toBeInstanceOf(Date);
    expect(result.current.showPicker).toBe(false);
    expect(typeof result.current.showDatePicker).toBe('function');
    expect(typeof result.current.hideDatePicker).toBe('function');
    expect(typeof result.current.handleUpdateDate).toBe('function');
    expect(typeof result.current.updateDate).toBe('function');
  });

  it('should initialize with custom initial date', () => {
    const { result } = renderHook(() => useDatePicker(mockInitialDate));

    expect(result.current.date).toEqual(mockInitialDate);
  });

  describe('showDatePicker', () => {
    it('should show the date picker', () => {
      const { result } = renderHook(() => useDatePicker());

      expect(result.current.showPicker).toBe(false);

      act(() => {
        result.current.showDatePicker();
      });

      expect(result.current.showPicker).toBe(true);
    });
  });

  describe('hideDatePicker', () => {
    it('should hide the date picker', () => {
      const { result } = renderHook(() => useDatePicker());

      // First show the picker
      act(() => {
        result.current.showDatePicker();
      });

      expect(result.current.showPicker).toBe(true);

      // Then hide it
      act(() => {
        result.current.hideDatePicker();
      });

      expect(result.current.showPicker).toBe(false);
    });
  });

  describe('handleUpdateDate', () => {
    it('should update date and hide picker when event type is "set"', () => {
      const { result } = renderHook(() => useDatePicker(mockInitialDate));
      const newDate = new Date('2024-02-01T12:00:00.000Z');
      const mockEvent = { type: 'set' };

      act(() => {
        result.current.showDatePicker();
      });

      expect(result.current.showPicker).toBe(true);

      act(() => {
        result.current.handleUpdateDate(mockEvent, newDate);
      });

      expect(result.current.date).toEqual(newDate);
      expect(result.current.showPicker).toBe(false);
    });

    it('should not update date when event type is not "set"', () => {
      const { result } = renderHook(() => useDatePicker(mockInitialDate));
      const newDate = new Date('2024-02-01T12:00:00.000Z');
      const mockEvent = { type: 'dismissed' };

      act(() => {
        result.current.showDatePicker();
      });

      expect(result.current.showPicker).toBe(true);

      act(() => {
        result.current.handleUpdateDate(mockEvent, newDate);
      });

      expect(result.current.date).toEqual(mockInitialDate);
      expect(result.current.showPicker).toBe(true);
    });

    it('should not update date when selectedDate is undefined', () => {
      const { result } = renderHook(() => useDatePicker(mockInitialDate));
      const mockEvent = { type: 'set' };

      act(() => {
        result.current.showDatePicker();
      });

      expect(result.current.showPicker).toBe(true);

      act(() => {
        result.current.handleUpdateDate(mockEvent, undefined);
      });

      expect(result.current.date).toEqual(mockInitialDate);
      expect(result.current.showPicker).toBe(true);
    });

    it('should handle null selectedDate gracefully', () => {
      const { result } = renderHook(() => useDatePicker(mockInitialDate));
      const mockEvent = { type: 'set' };

      act(() => {
        result.current.showDatePicker();
      });

      expect(result.current.showPicker).toBe(true);

      act(() => {
        result.current.handleUpdateDate(mockEvent, null);
      });

      expect(result.current.date).toEqual(mockInitialDate);
      expect(result.current.showPicker).toBe(true);
    });
  });

  describe('updateDate', () => {
    it('should update the date value', () => {
      const { result } = renderHook(() => useDatePicker(mockInitialDate));
      const newDate = new Date('2024-02-01T12:00:00.000Z');

      expect(result.current.date).toEqual(mockInitialDate);

      act(() => {
        result.current.updateDate(newDate);
      });

      expect(result.current.date).toEqual(newDate);
    });

    it('should handle different date formats', () => {
      const { result } = renderHook(() => useDatePicker(mockInitialDate));
      const dates = [
        new Date('2024-01-01'),
        new Date('2024-12-31'),
        new Date('2025-06-15'),
        new Date('2023-03-20'),
      ];

      dates.forEach((date) => {
        act(() => {
          result.current.updateDate(date);
        });

        expect(result.current.date).toEqual(date);
      });
    });
  });

  describe('date picker visibility flow', () => {
    it('should handle complete show/hide cycle', () => {
      const { result } = renderHook(() => useDatePicker());

      // Initially hidden
      expect(result.current.showPicker).toBe(false);

      // Show picker
      act(() => {
        result.current.showDatePicker();
      });
      expect(result.current.showPicker).toBe(true);

      // Hide picker
      act(() => {
        result.current.hideDatePicker();
      });
      expect(result.current.showPicker).toBe(false);

      // Show again
      act(() => {
        result.current.showDatePicker();
      });
      expect(result.current.showPicker).toBe(true);
    });

    it('should maintain date picker state independently of date updates', () => {
      const { result } = renderHook(() => useDatePicker(mockInitialDate));

      // Show picker
      act(() => {
        result.current.showDatePicker();
      });
      expect(result.current.showPicker).toBe(true);

      // Update date without affecting picker visibility
      const newDate = new Date('2024-02-01T12:00:00.000Z');
      act(() => {
        result.current.updateDate(newDate);
      });

      expect(result.current.date).toEqual(newDate);
      expect(result.current.showPicker).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle multiple rapid date picker operations', () => {
      const { result } = renderHook(() => useDatePicker(mockInitialDate));

      // Rapidly show and hide the picker
      act(() => {
        result.current.showDatePicker();
        result.current.hideDatePicker();
        result.current.showDatePicker();
        result.current.hideDatePicker();
      });

      expect(result.current.showPicker).toBe(false);
    });

    it('should handle multiple rapid date updates', () => {
      const { result } = renderHook(() => useDatePicker(mockInitialDate));
      const dates = [
        new Date('2024-01-01'),
        new Date('2024-01-02'),
        new Date('2024-01-03'),
      ];

      act(() => {
        dates.forEach((date) => {
          result.current.updateDate(date);
        });
      });

      expect(result.current.date).toEqual(dates[2]);
    });

    it('should handle date picker events with missing properties', () => {
      const { result } = renderHook(() => useDatePicker(mockInitialDate));

      act(() => {
        result.current.showDatePicker();
      });

      expect(result.current.showPicker).toBe(true);

      // Test with event missing type property
      act(() => {
        result.current.handleUpdateDate({}, new Date('2024-02-01'));
      });

      expect(result.current.date).toEqual(mockInitialDate);
      expect(result.current.showPicker).toBe(true);

      // Test with event missing selectedDate property
      act(() => {
        result.current.handleUpdateDate({ type: 'set' });
      });

      expect(result.current.date).toEqual(mockInitialDate);
      expect(result.current.showPicker).toBe(true);
    });
  });

  describe('date formatting and validation', () => {
    it('should preserve date precision', () => {
      const { result } = renderHook(() => useDatePicker(mockInitialDate));
      const preciseDate = new Date('2024-01-01T10:30:45.123Z');

      act(() => {
        result.current.updateDate(preciseDate);
      });

      expect(result.current.date.getTime()).toBe(preciseDate.getTime());
    });

    it('should handle invalid dates gracefully', () => {
      const { result } = renderHook(() => useDatePicker(mockInitialDate));
      const invalidDate = new Date('invalid-date');

      act(() => {
        result.current.updateDate(invalidDate);
      });

      // Should still update the date even if it's invalid
      expect(result.current.date).toEqual(invalidDate);
    });
  });

  describe('hook lifecycle', () => {
    it('should maintain state across re-renders', () => {
      const { result, rerender } = renderHook(() => useDatePicker(mockInitialDate));

      // Update date
      const newDate = new Date('2024-02-01T12:00:00.000Z');
      act(() => {
        result.current.updateDate(newDate);
      });

      expect(result.current.date).toEqual(newDate);

      // Re-render the hook
      rerender();

      // State should be preserved
      expect(result.current.date).toEqual(newDate);
    });

    it('should not lose state when showPicker is toggled', () => {
      const { result } = renderHook(() => useDatePicker(mockInitialDate));
      const newDate = new Date('2024-02-01T12:00:00.000Z');

      // Update date
      act(() => {
        result.current.updateDate(newDate);
      });

      // Toggle picker visibility multiple times
      act(() => {
        result.current.showDatePicker();
        result.current.hideDatePicker();
        result.current.showDatePicker();
        result.current.hideDatePicker();
      });

      // Date should still be preserved
      expect(result.current.date).toEqual(newDate);
    });
  });
});
