import { renderHook, act } from '@testing-library/react-native';
import useReportGeneration from '../../../app/ProjectInfo/useReportGeneration';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';
import { Alert } from 'react-native';

// Mock the expo modules
jest.mock('expo-print');
jest.mock('expo-file-system');
jest.mock('expo-sharing');

// Mock the toast context
const mockShowToast = jest.fn();
jest.mock('../../../components/Toast/ToastContext', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock Alert
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));


// Mock the utility functions
jest.mock('../../../utils/pdfReportService', () => ({
  generateReportHTML: jest.fn(() => '<html>Mock HTML</html>'),
}));

jest.mock('../../../utils/parser', () => ({
  fullDate: jest.fn((date) => '01/01/2024'),
}));

jest.mock('../../../utils/preferencesUtils', () => ({
  getPDFTemplatePreference: jest.fn(() => Promise.resolve('dark')),
}));

describe('useReportGeneration', () => {
  const mockDatabase = {} as any;
  
  const mockProject = {
    name: 'Test Project',
    project_id: '123',
    hourly_cost: 50.00,
  };

  const mockTimings = [
    {
      task_completed: 1,
      timing_created_at: '2024-01-01 10:00:00',
      task_name: 'Test Task',
      timing_timed: 3600,
    },
  ];

  const mockGetTimings = jest.fn(() => Promise.resolve(mockTimings));

  beforeEach(() => {
    jest.clearAllMocks();
    mockShowToast.mockClear();
    
    // Mock Print
    (Print.printToFileAsync as jest.Mock).mockResolvedValue({ uri: '/mock/uri/file.pdf' });
    
    // Mock FileSystem
    (FileSystem.moveAsync as jest.Mock).mockResolvedValue(undefined);
    
    // Mock shareAsync
    (shareAsync as jest.Mock).mockResolvedValue(undefined);
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useReportGeneration(mockDatabase));

    expect(result.current.isGeneratingReport).toBe(false);
    expect(typeof result.current.handleGenerateReport).toBe('function');
    expect(typeof result.current.getInitOfDay).toBe('function');
    expect(typeof result.current.getEndOfDay).toBe('function');
  });

  describe('getInitOfDay', () => {
    it('should return start of day in correct format', () => {
      const { result } = renderHook(() => useReportGeneration(mockDatabase));
      const testDate = new Date('2024-01-01T15:30:45.123');
      
      const formattedDate = result.current.getInitOfDay(testDate);
      
      expect(formattedDate).toBe('2024-01-01 03:00:00');
    });

    it('should handle different dates correctly', () => {
      const { result } = renderHook(() => useReportGeneration(mockDatabase));
      const testDate = new Date('2024-12-31T23:59:59.999');
      
      const formattedDate = result.current.getInitOfDay(testDate);
      
      expect(formattedDate).toBe('2024-12-31 03:00:00');
    });
  });

  describe('getEndOfDay', () => {
    it('should return end of day in correct format', () => {
      const { result } = renderHook(() => useReportGeneration(mockDatabase));
      const testDate = new Date('2024-01-01T15:30:45.123');
      
      const formattedDate = result.current.getEndOfDay(testDate);
      
      expect(formattedDate).toBe('2024-01-02 02:59:59');
    });

    it('should handle different dates correctly', () => {
      const { result } = renderHook(() => useReportGeneration(mockDatabase));
      const testDate = new Date('2024-12-31T00:00:00.000');
      
      const formattedDate = result.current.getEndOfDay(testDate);
      
      expect(formattedDate).toBe('2025-01-01 02:59:59');
    });
  });

  describe('handleGenerateReport', () => {
    it('should generate report successfully', async () => {
      const { result } = renderHook(() => useReportGeneration(mockDatabase));
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      await act(async () => {
        await result.current.handleGenerateReport({
          project: mockProject,
          projectID: '123',
          startDate,
          endDate,
          getTimings: mockGetTimings,
        });
      });

      expect(mockGetTimings).toHaveBeenCalled();
      expect(Print.printToFileAsync).toHaveBeenCalledWith({
        html: '<html>Mock HTML</html>',
        margins: {
          left: 20,
          top: 20,
          right: 20,
          bottom: 20,
        },
      });
      expect(FileSystem.moveAsync).toHaveBeenCalled();
      expect(shareAsync).toHaveBeenCalled();
      expect(mockShowToast).toHaveBeenCalledWith('Relatório PDF gerado com sucesso!', 'success');
    });

    it('should not generate report if already generating', async () => {
      const { result } = renderHook(() => useReportGeneration(mockDatabase));
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      // Mock getTimings to be slow so we can test the blocking behavior
      const slowMockGetTimings = jest.fn(() => new Promise<any[]>(resolve => setTimeout(() => resolve(mockTimings), 100)));

      // Start first generation (this will be slow)
      const firstGeneration = result.current.handleGenerateReport({
        project: mockProject,
        projectID: '123',
        startDate,
        endDate,
        getTimings: slowMockGetTimings,
      });

      // Wait for the first generation to start and set the state
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      // Now try to start a second generation while the first is still running
      const secondGeneration = result.current.handleGenerateReport({
        project: mockProject,
        projectID: '123',
        startDate,
        endDate,
        getTimings: slowMockGetTimings,
      });

      // Wait for both to complete
      await act(async () => {
        await Promise.all([firstGeneration, secondGeneration]);
      });

      // The second call should be blocked by the early return, so getTimings should only be called once
      expect(slowMockGetTimings).toHaveBeenCalledTimes(1);
    });

    it('should not generate report if project is null', async () => {
      const { result } = renderHook(() => useReportGeneration(mockDatabase));
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      await act(async () => {
        await result.current.handleGenerateReport({
          project: null,
          projectID: '123',
          startDate,
          endDate,
          getTimings: mockGetTimings,
        });
      });

      expect(mockGetTimings).not.toHaveBeenCalled();
      expect(Print.printToFileAsync).not.toHaveBeenCalled();
    });

    it('should show error when no timings are found', async () => {
      const { result } = renderHook(() => useReportGeneration(mockDatabase));
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const mockGetTimingsEmpty = jest.fn(() => Promise.resolve([]));

      await act(async () => {
        await result.current.handleGenerateReport({
          project: mockProject,
          projectID: '123',
          startDate,
          endDate,
          getTimings: mockGetTimingsEmpty,
        });
      });

      expect(mockShowToast).toHaveBeenCalledWith(
        'Não foram encontradas sessões de trabalho no período selecionado. Verifique as datas ou adicione algumas sessões de trabalho.',
        'warning'
      );
      expect(Print.printToFileAsync).not.toHaveBeenCalled();
    });

    it('should handle PDF generation errors gracefully', async () => {
      const { result } = renderHook(() => useReportGeneration(mockDatabase));
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      
      // Mock Print to throw an error
      (Print.printToFileAsync as jest.Mock).mockRejectedValue(new Error('PDF generation failed'));

      await act(async () => {
        await result.current.handleGenerateReport({
          project: mockProject,
          projectID: '123',
          startDate,
          endDate,
          getTimings: mockGetTimings,
        });
      });

      expect(mockShowToast).toHaveBeenCalledWith(
        'Ocorreu um erro ao gerar o relatório PDF. Tente novamente ou verifique se há espaço suficiente no dispositivo.',
        'error'
      );
    });

    it('should handle file system errors gracefully', async () => {
      const { result } = renderHook(() => useReportGeneration(mockDatabase));
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      
      // Mock FileSystem to throw an error
      (FileSystem.moveAsync as jest.Mock).mockRejectedValue(new Error('File system error'));

      await act(async () => {
        await result.current.handleGenerateReport({
          project: mockProject,
          projectID: '123',
          startDate,
          endDate,
          getTimings: mockGetTimings,
        });
      });

      expect(mockShowToast).toHaveBeenCalledWith(
        'Ocorreu um erro ao gerar o relatório PDF. Tente novamente ou verifique se há espaço suficiente no dispositivo.',
        'error'
      );
    });

    it('should handle sharing errors gracefully', async () => {
      const { result } = renderHook(() => useReportGeneration(mockDatabase));
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      
      // Mock shareAsync to throw an error
      (shareAsync as jest.Mock).mockRejectedValue(new Error('Sharing failed'));

      await act(async () => {
        await result.current.handleGenerateReport({
          project: mockProject,
          projectID: '123',
          startDate,
          endDate,
          getTimings: mockGetTimings,
        });
      });

      expect(mockShowToast).toHaveBeenCalledWith(
        'Ocorreu um erro ao gerar o relatório PDF. Tente novamente ou verifique se há espaço suficiente no dispositivo.',
        'error'
      );
    });

    it('should set isGeneratingReport to false after completion', async () => {
      const { result } = renderHook(() => useReportGeneration(mockDatabase));
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      expect(result.current.isGeneratingReport).toBe(false);

      // Start the generation
      const generationPromise = result.current.handleGenerateReport({
        project: mockProject,
        projectID: '123',
        startDate,
        endDate,
        getTimings: mockGetTimings,
      });

      // Wait for the promise to complete
      await act(async () => {
        await generationPromise;
      });

      // Should be false after completion
      expect(result.current.isGeneratingReport).toBe(false);
    });

    it('should set isGeneratingReport to false after error', async () => {
      const { result } = renderHook(() => useReportGeneration(mockDatabase));
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      
      // Mock Print to throw an error
      (Print.printToFileAsync as jest.Mock).mockRejectedValue(new Error('PDF generation failed'));

      // Start the generation
      const generationPromise = result.current.handleGenerateReport({
        project: mockProject,
        projectID: '123',
        startDate,
        endDate,
        getTimings: mockGetTimings,
      });

      // Wait for the promise to complete (with error)
      await act(async () => {
        await generationPromise;
      });

      // Should be false after error
      expect(result.current.isGeneratingReport).toBe(false);
    });

    it('should generate correct document name', async () => {
      const { result } = renderHook(() => useReportGeneration(mockDatabase));
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      await act(async () => {
        await result.current.handleGenerateReport({
          project: mockProject,
          projectID: '123',
          startDate,
          endDate,
          getTimings: mockGetTimings,
        });
      });

      // The document name should be generated with the project name and dates
      expect(FileSystem.moveAsync).toHaveBeenCalledWith({
        from: '/mock/uri/file.pdf',
        to: expect.stringContaining('Relatorio_Test_Project_01-01-2024_01-01-2024.pdf'),
      });
    });
  });
});
