import { useState, useCallback } from "react";

/**
 * Custom hook for form validation
 * @param {Object} options - Validation configuration options
 * @param {number} options.maxLength - Maximum allowed length for the input
 * @param {Function} options.validator - Custom validation function
 * @returns {Object} Validation state and functions
 */
export const useFormValidation = ({
  maxLength,
  validator,
}: {
  maxLength?: number;
  validator?: (value: string) => string | null;
} = {}) => {
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);

  /**
   * Validates the input value
   * @param {string} value - The value to validate
   * @returns {boolean} Whether the value is valid
   */
  const validate = useCallback((value: string): boolean => {
    let newError: string | null = null;

    // Check max length
    if (maxLength !== undefined && value && value.length > maxLength) {
      newError = `Máximo de ${maxLength} caracteres permitidos`;
    }

    // Check custom validator
    if (validator && !newError) {
      const validatorResult = validator(value);
      if (validatorResult !== null && validatorResult !== undefined) {
        // Treat empty string and false as errors, but preserve the original value
        newError = validatorResult;
      }
    }

    setError(newError);
    // Treat null/undefined as valid, empty string and false as invalid (errors)
    const isValid = newError === null || newError === undefined;
    setIsValid(isValid);
    return isValid;
  }, [maxLength, validator]);

  /**
   * Clears the validation error
   */
  const clearError = useCallback(() => {
    setError(null);
    setIsValid(true);
  }, []);

  /**
   * Sets a custom error message
   * @param {string} message - The error message to set
   */
  const setCustomError = useCallback((message: string) => {
    setError(message);
    setIsValid(false);
  }, []);

  return {
    error,
    isValid,
    validate,
    clearError,
    setCustomError,
  };
};
