import { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";

/**
 * Custom hook for managing date picker functionality
 * @param {Date} initialDate - Initial date value
 * @returns {Object} Date picker state and functions
 */
const useDatePicker = (initialDate: Date = new Date()) => {
  const [date, setDate] = useState<Date>(initialDate);
  const [showPicker, setShowPicker] = useState(false);

  /**
   * Shows the date picker
   */
  const showDatePicker = () => {
    setShowPicker(true);
  };

  /**
   * Hides the date picker
   */
  const hideDatePicker = () => {
    setShowPicker(false);
  };

  /**
   * Handles date updates from the date picker
   * @param {any} event - Date picker event
   * @param {Date | undefined} selectedDate - The selected date
   */
  const handleUpdateDate = (event: any, selectedDate?: Date) => {
    if (event.type !== "set" || !selectedDate) return;
    
    setDate(selectedDate);
    hideDatePicker();
  };

  /**
   * Updates the date value
   * @param {Date} newDate - New date value
   */
  const updateDate = (newDate: Date) => {
    setDate(newDate);
  };

  return {
    date,
    showPicker,
    showDatePicker,
    hideDatePicker,
    handleUpdateDate,
    updateDate,
  };
};

export default useDatePicker;
