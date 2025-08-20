import { renderHook, act } from '@testing-library/react-native';
import { useFormValidation } from '../../../components/TextInput/useFormValidation';

describe('useFormValidation', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useFormValidation());

    expect(result.current.error).toBe(null);
    expect(result.current.isValid).toBe(true);
    expect(typeof result.current.validate).toBe('function');
    expect(typeof result.current.clearError).toBe('function');
    expect(typeof result.current.setCustomError).toBe('function');
  });

  describe('validate function', () => {
    it('should validate maxLength constraint', () => {
      const { result } = renderHook(() => useFormValidation({ maxLength: 10 }));

      act(() => {
        const isValid = result.current.validate('This is a very long text that exceeds the limit');
        expect(isValid).toBe(false);
      });

      expect(result.current.error).toBe('Máximo de 10 caracteres permitidos');
      expect(result.current.isValid).toBe(false);
    });

    it('should pass validation when text is within maxLength', () => {
      const { result } = renderHook(() => useFormValidation({ maxLength: 20 }));

      act(() => {
        const isValid = result.current.validate('Short text');
        expect(isValid).toBe(true);
      });

      expect(result.current.error).toBe(null);
      expect(result.current.isValid).toBe(true);
    });

    it('should pass validation when text equals maxLength', () => {
      const { result } = renderHook(() => useFormValidation({ maxLength: 10 }));

      act(() => {
        const isValid = result.current.validate('Exactly 10');
        expect(isValid).toBe(true);
      });

      expect(result.current.error).toBe(null);
      expect(result.current.isValid).toBe(true);
    });

    it('should use custom validator when provided', () => {
      const customValidator = (value: string) => {
        if (value.includes('error')) {
          return 'Custom error message';
        }
        return null;
      };

      const { result } = renderHook(() => useFormValidation({ validator: customValidator }));

      act(() => {
        const isValid = result.current.validate('This text contains error');
        expect(isValid).toBe(false);
      });

      expect(result.current.error).toBe('Custom error message');
      expect(result.current.isValid).toBe(false);
    });

    it('should prioritize maxLength over custom validator', () => {
      const customValidator = (value: string) => {
        if (value.includes('error')) {
          return 'Custom error message';
        }
        return null;
      };

      const { result } = renderHook(() => useFormValidation({ 
        maxLength: 5, 
        validator: customValidator 
      }));

      act(() => {
        const isValid = result.current.validate('This text contains error and is too long');
        expect(isValid).toBe(false);
      });

      // Should show maxLength error, not custom validator error
      expect(result.current.error).toBe('Máximo de 5 caracteres permitidos');
      expect(result.current.isValid).toBe(false);
    });

    it('should use custom validator when maxLength passes', () => {
      const customValidator = (value: string) => {
        if (value.includes('error')) {
          return 'Custom error message';
        }
        return null;
      };

      const { result } = renderHook(() => useFormValidation({ 
        maxLength: 50, 
        validator: customValidator 
      }));

      act(() => {
        const isValid = result.current.validate('This text contains error but is short enough');
        expect(isValid).toBe(false);
      });

      // Should show custom validator error since maxLength passes
      expect(result.current.error).toBe('Custom error message');
      expect(result.current.isValid).toBe(false);
    });

    it('should handle empty string validation', () => {
      const { result } = renderHook(() => useFormValidation({ maxLength: 10 }));

      act(() => {
        const isValid = result.current.validate('');
        expect(isValid).toBe(true);
      });

      expect(result.current.error).toBe(null);
      expect(result.current.isValid).toBe(true);
    });

    it('should handle null and undefined values', () => {
      const { result } = renderHook(() => useFormValidation({ maxLength: 10 }));

      act(() => {
        const isValid = result.current.validate(null as any);
        expect(isValid).toBe(true);
      });

      expect(result.current.error).toBe(null);
      expect(result.current.isValid).toBe(true);

      act(() => {
        const isValid = result.current.validate(undefined as any);
        expect(isValid).toBe(true);
      });

      expect(result.current.error).toBe(null);
      expect(result.current.isValid).toBe(true);
    });
  });

  describe('clearError function', () => {
    it('should clear existing error', () => {
      const { result } = renderHook(() => useFormValidation({ maxLength: 5 }));

      // First create an error
      act(() => {
        result.current.validate('This is too long');
      });

      expect(result.current.error).toBe('Máximo de 5 caracteres permitidos');
      expect(result.current.isValid).toBe(false);

      // Then clear it
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
      expect(result.current.isValid).toBe(true);
    });

    it('should work when no error exists', () => {
      const { result } = renderHook(() => useFormValidation());

      expect(result.current.error).toBe(null);
      expect(result.current.isValid).toBe(true);

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
      expect(result.current.isValid).toBe(true);
    });
  });

  describe('setCustomError function', () => {
    it('should set custom error message', () => {
      const { result } = renderHook(() => useFormValidation());

      act(() => {
        result.current.setCustomError('Custom error message');
      });

      expect(result.current.error).toBe('Custom error message');
      expect(result.current.isValid).toBe(false);
    });

    it('should override existing error', () => {
      const { result } = renderHook(() => useFormValidation({ maxLength: 5 }));

      // First create an error
      act(() => {
        result.current.validate('This is too long');
      });

      expect(result.current.error).toBe('Máximo de 5 caracteres permitidos');

      // Then set custom error
      act(() => {
        result.current.setCustomError('Custom error message');
      });

      expect(result.current.error).toBe('Custom error message');
      expect(result.current.isValid).toBe(false);
    });

    it('should handle empty string error message', () => {
      const { result } = renderHook(() => useFormValidation());

      act(() => {
        result.current.setCustomError('');
      });

      expect(result.current.error).toBe('');
      expect(result.current.isValid).toBe(false);
    });
  });

  describe('validation flow', () => {
    it('should handle complete validation cycle', () => {
      const { result } = renderHook(() => useFormValidation({ maxLength: 10 }));

      // Start with no error
      expect(result.current.error).toBe(null);
      expect(result.current.isValid).toBe(true);

      // Create error
      act(() => {
        result.current.validate('This text is way too long for the limit');
      });

      expect(result.current.error).toBe('Máximo de 10 caracteres permitidos');
      expect(result.current.isValid).toBe(false);

      // Clear error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
      expect(result.current.isValid).toBe(true);

      // Set custom error
      act(() => {
        result.current.setCustomError('Custom error');
      });

      expect(result.current.error).toBe('Custom error');
      expect(result.current.isValid).toBe(false);

      // Validate again (should clear custom error and apply maxLength)
      act(() => {
        result.current.validate('Short');
      });

      expect(result.current.error).toBe(null);
      expect(result.current.isValid).toBe(true);
    });

    it('should maintain validation state across multiple validations', () => {
      const { result } = renderHook(() => useFormValidation({ maxLength: 15 }));

      const testCases = [
        { text: 'Short', expectedValid: true, expectedError: null },
        { text: 'Exactly 15 char', expectedValid: true, expectedError: null },
        { text: 'This is way too long for the limit', expectedValid: false, expectedError: 'Máximo de 15 caracteres permitidos' },
        { text: 'Short again', expectedValid: true, expectedError: null },
      ];

      testCases.forEach(({ text, expectedValid, expectedError }) => {
        act(() => {
          const isValid = result.current.validate(text);
          expect(isValid).toBe(expectedValid);
        });

        expect(result.current.isValid).toBe(expectedValid);
        expect(result.current.error).toBe(expectedError);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle very long text gracefully', () => {
      const { result } = renderHook(() => useFormValidation({ maxLength: 1000 }));

      const veryLongText = 'a'.repeat(2000);

      act(() => {
        const isValid = result.current.validate(veryLongText);
        expect(isValid).toBe(false);
      });

      expect(result.current.error).toBe('Máximo de 1000 caracteres permitidos');
      expect(result.current.isValid).toBe(false);
    });

    it('should handle zero maxLength', () => {
      const { result } = renderHook(() => useFormValidation({ maxLength: 0 }));

      act(() => {
        const isValid = result.current.validate('Any text');
        expect(isValid).toBe(false);
      });

      expect(result.current.error).toBe('Máximo de 0 caracteres permitidos');
      expect(result.current.isValid).toBe(false);
    });

    it('should handle negative maxLength', () => {
      const { result } = renderHook(() => useFormValidation({ maxLength: -5 }));

      act(() => {
        const isValid = result.current.validate('Any text');
        expect(isValid).toBe(false);
      });

      expect(result.current.error).toBe('Máximo de -5 caracteres permitidos');
      expect(result.current.isValid).toBe(false);
    });

    it('should handle custom validator that returns empty string', () => {
      const customValidator = (value: string) => {
        if (value.includes('error')) {
          return '';
        }
        return null;
      };

      const { result } = renderHook(() => useFormValidation({ validator: customValidator }));

      act(() => {
        const isValid = result.current.validate('This text contains error');
        expect(isValid).toBe(false);
      });

      expect(result.current.error).toBe('');
      expect(result.current.isValid).toBe(false);
    });

    it('should handle custom validator that returns false', () => {
      const customValidator = (value: string) => {
        if (value.includes('error')) {
          return false as any;
        }
        return null;
      };

      const { result } = renderHook(() => useFormValidation({ validator: customValidator }));

      act(() => {
        const isValid = result.current.validate('This text contains error');
        expect(isValid).toBe(false);
      });

      expect(result.current.error).toBe(false);
      expect(result.current.isValid).toBe(false);
    });
  });

  describe('hook lifecycle', () => {
    it('should maintain state across re-renders', () => {
      const { result, rerender } = renderHook(() => useFormValidation({ maxLength: 10 }));

      // Create an error
      act(() => {
        result.current.validate('This is too long');
      });

      expect(result.current.error).toBe('Máximo de 10 caracteres permitidos');

      // Re-render the hook
      rerender();

      // State should be preserved
      expect(result.current.error).toBe('Máximo de 10 caracteres permitidos');
      expect(result.current.isValid).toBe(false);
    });

    it('should handle multiple rapid validations', () => {
      const { result } = renderHook(() => useFormValidation({ maxLength: 10 }));

      const texts = ['Short', 'Too long text', 'Short again', 'Another long text'];

      act(() => {
        texts.forEach(text => {
          result.current.validate(text);
        });
      });

      // Should show the last validation result
      expect(result.current.error).toBe('Máximo de 10 caracteres permitidos');
      expect(result.current.isValid).toBe(false);
    });
  });
});
