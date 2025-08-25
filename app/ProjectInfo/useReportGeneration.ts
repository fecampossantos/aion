import { useState, useRef } from "react";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import { shareAsync } from "expo-sharing";
import { useToast } from "../../components/Toast/ToastContext";
import { generateReportHTML } from "../../utils/pdfReportService";
import { fullDate } from "../../utils/parser";

/**
 * Custom hook for generating and sharing PDF reports
 * @returns {Object} Report generation functions and state
 */
const useReportGeneration = () => {
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const isGeneratingRef = useRef(false);
  const { showToast } = useToast();

  /**
   * Gets the start of day as ISO string for database queries
   * @param {Date} day - The date to get start of day for
   * @returns {string} ISO string formatted for database
   */
  const getInitOfDay = (day: Date) => {
    const startOfDay = new Date(day);
    startOfDay.setHours(0, 0, 0, 0);
    return startOfDay.toISOString().slice(0, 19).replace("T", " ");
  };

  /**
   * Gets the end of day as ISO string for database queries
   * @param {Date} day - The date to get end of day for
   * @returns {string} ISO string formatted for database
   */
  const getEndOfDay = (day: Date) => {
    const endOfDay = new Date(day);
    endOfDay.setHours(23, 59, 59, 999);
    return endOfDay.toISOString().slice(0, 19).replace("T", " ");
  };

  /**
   * Generates and shares the PDF report
   * @param {Object} options - Report generation options
   * @param {any} options.project - The project object
   * @param {string} options.projectID - The project ID
   * @param {Date} options.startDate - Start date for the report
   * @param {Date} options.endDate - End date for the report
   * @param {Function} options.getTimings - Function to get timing data
   * @returns {Promise<void>}
   */
  const handleGenerateReport = async ({
    project,
    projectID,
    startDate,
    endDate,
    getTimings,
  }: {
    project: any;
    projectID: string;
    startDate: Date;
    endDate: Date;
    getTimings: () => Promise<any[]>;
  }) => {
    if (isGeneratingRef.current || !project) return;

    isGeneratingRef.current = true;
    setIsGeneratingReport(true);
    
    try {
      // Get comprehensive timing data with task information
      const timings = await getTimings();

      if (timings.length === 0) {
        showToast(
          "Não foram encontradas sessões de trabalho no período selecionado. Verifique as datas ou adicione algumas sessões de trabalho.",
          "warning"
        );
        isGeneratingRef.current = false;
        setIsGeneratingReport(false);
        return;
      }

      const startDateSTR = fullDate(startDate.toString());
      const endDateSTR = fullDate(endDate.toString());

      const documentName = `Relatorio_${project.name.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}_${startDateSTR.replaceAll("/", "-")}_${endDateSTR.replaceAll(
        "/",
        "-"
      )}`;

      const html = generateReportHTML(
        project,
        startDateSTR,
        endDateSTR,
        timings,
        documentName
      );

      const { uri } = await Print.printToFileAsync({
        html,
        margins: {
          left: 20,
          top: 20,
          right: 20,
          bottom: 20,
        },
      });

      const pdfFile = `${uri.slice(
        0,
        uri.lastIndexOf("/") + 1
      )}${documentName}.pdf`;

      await FileSystem.moveAsync({
        from: uri,
        to: pdfFile,
      });

      await shareAsync(pdfFile, { UTI: ".pdf", mimeType: "application/pdf" });

      showToast("Relatório PDF gerado com sucesso!", "success");
    } catch (e) {
      console.warn("Error generating report:", e);
      showToast(
        "Ocorreu um erro ao gerar o relatório PDF. Tente novamente ou verifique se há espaço suficiente no dispositivo.",
        "error"
      );
    } finally {
      isGeneratingRef.current = false;
      setIsGeneratingReport(false);
    }
  };

  return {
    isGeneratingReport,
    handleGenerateReport,
    getInitOfDay,
    getEndOfDay,
  };
};

export default useReportGeneration;
