// Mock for useToast hook
export const useToast = () => ({
  showToast: jest.fn(),
});

// Mock for ToastProvider
export const ToastProvider = ({ children }: { children: React.ReactNode }) => children;
