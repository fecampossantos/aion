// This file is now deprecated. Use the Toast context instead.
// Import { useToast } from '../components/Toast' and use showToast(message, type)

/**
 * @deprecated Use useToast hook instead
 * This file is kept for backward compatibility but will be removed
 */
export const showSuccessToast = (message: string, title?: string) => {
  console.warn('showSuccessToast is deprecated. Use useToast hook instead.');
  // This will be replaced by the Toast context
};

export const showErrorToast = (message: string, title?: string) => {
  console.warn('showErrorToast is deprecated. Use useToast hook instead.');
  // This will be replaced by the Toast context
};

export const showInfoToast = (message: string, title?: string) => {
  console.warn('showInfoToast is deprecated. Use useToast hook instead.');
  // This will be replaced by the Toast context
};

export const showWarningToast = (message: string, title?: string) => {
  console.warn('showWarningToast is deprecated. Use useToast hook instead.');
  // This will be replaced by the Toast context
};
