import {
  parseToCurrencyFormat,
  secondsToHHMMSS,
  secondsToTimeHHMMSS,
  fullDateWithHour,
  fullDate,
  fullHour,
  formatJsDateToDatabase,
} from "./parser";

describe("Parser Utilities", () => {
  describe("parseToCurrencyFormat", () => {
    it("formats currency correctly for valid input", () => {
      expect(parseToCurrencyFormat("123")).toBe("01,23");
      expect(parseToCurrencyFormat("1234")).toBe("12,34");
      expect(parseToCurrencyFormat("12345")).toBe("123,45");
    });

    it("handles small numbers correctly", () => {
      expect(parseToCurrencyFormat("1")).toBe("00,01");
      expect(parseToCurrencyFormat("12")).toBe("00,12");
    });

    it("returns undefined for ignored characters", () => {
      expect(parseToCurrencyFormat("123,")).toBeUndefined();
      expect(parseToCurrencyFormat("123.")).toBeUndefined();
      expect(parseToCurrencyFormat("123-")).toBeUndefined();
      expect(parseToCurrencyFormat("123 ")).toBeUndefined();
    });

    it("handles empty string", () => {
      expect(parseToCurrencyFormat("")).toBe("00,00");
    });

    it("handles string with existing comma", () => {
      expect(parseToCurrencyFormat("12,34")).toBe("12,34");
    });
  });

  describe("secondsToHHMMSS", () => {
    it("converts seconds correctly", () => {
      expect(secondsToHHMMSS(0)).toEqual({ hours: 0, minutes: 0, seconds: 0 });
      expect(secondsToHHMMSS(59)).toEqual({ hours: 0, minutes: 0, seconds: 59 });
      expect(secondsToHHMMSS(60)).toEqual({ hours: 0, minutes: 1, seconds: 0 });
      expect(secondsToHHMMSS(3600)).toEqual({ hours: 1, minutes: 0, seconds: 0 });
      expect(secondsToHHMMSS(3661)).toEqual({ hours: 1, minutes: 1, seconds: 1 });
      expect(secondsToHHMMSS(7323)).toEqual({ hours: 2, minutes: 2, seconds: 3 });
    });

    it("handles large numbers", () => {
      expect(secondsToHHMMSS(86400)).toEqual({ hours: 24, minutes: 0, seconds: 0 }); // 24 hours
      expect(secondsToHHMMSS(90061)).toEqual({ hours: 25, minutes: 1, seconds: 1 }); // 25 hours, 1 minute, 1 second
    });
  });

  describe("secondsToTimeHHMMSS", () => {
    it("formats time string correctly", () => {
      expect(secondsToTimeHHMMSS(0)).toBe("00:00:00");
      expect(secondsToTimeHHMMSS(59)).toBe("00:00:59");
      expect(secondsToTimeHHMMSS(60)).toBe("00:01:00");
      expect(secondsToTimeHHMMSS(3600)).toBe("01:00:00");
      expect(secondsToTimeHHMMSS(3661)).toBe("01:01:01");
      expect(secondsToTimeHHMMSS(7323)).toBe("02:02:03");
    });

    it("pads single digits with zeros", () => {
      expect(secondsToTimeHHMMSS(3)).toBe("00:00:03");
      expect(secondsToTimeHHMMSS(63)).toBe("00:01:03");
      expect(secondsToTimeHHMMSS(3603)).toBe("01:00:03");
    });
  });

  describe("fullDateWithHour", () => {
    it("formats date and time correctly", () => {
      const dateString = "2023-12-01T10:30:45";
      const result = fullDateWithHour(dateString);
      
      expect(result.d).toBe("01/12/2023");
      expect(result.time).toBe("10:30:45");
    });

    it("handles different time formats", () => {
      const dateString = "2023-01-15T09:05:03";
      const result = fullDateWithHour(dateString);
      
      expect(result.d).toBe("15/01/2023");
      expect(result.time).toBe("09:05:03");
    });

    it("pads single digit times with zeros", () => {
      const dateString = "2023-01-01T01:02:03";
      const result = fullDateWithHour(dateString);
      
      expect(result.time).toBe("01:02:03");
    });
  });

  describe("fullDate", () => {
    it("formats date correctly", () => {
      expect(fullDate("2023-12-01T10:30:45")).toBe("01/12/2023");
      expect(fullDate("2023-01-15T09:05:03")).toBe("15/01/2023");
    });

    it("handles different date formats", () => {
      expect(fullDate("2023-12-25")).toBe("25/12/2023");
    });
  });

  describe("fullHour", () => {
    it("formats hour correctly", () => {
      expect(fullHour("2023-12-01T10:30:45")).toBe("10:30h");
      expect(fullHour("2023-01-15T09:05:03")).toBe("09:05h");
    });

    it("pads single digit hours and minutes", () => {
      expect(fullHour("2023-01-01T01:02:03")).toBe("01:02h");
      expect(fullHour("2023-01-01T23:59:59")).toBe("23:59h");
    });
  });

  describe("formatJsDateToDatabase", () => {
    it("formats JavaScript Date to database format", () => {
      const date = new Date("2023-12-01T10:30:45");
      const result = formatJsDateToDatabase(date);
      
      expect(result).toBe("2023-12-01 10:30:45");
    });

    it("pads single digit values with zeros", () => {
      const date = new Date("2023-01-01T01:02:03");
      const result = formatJsDateToDatabase(date);
      
      expect(result).toBe("2023-01-01 01:02:03");
    });

    it("handles different dates correctly", () => {
      const date = new Date("2024-02-29T23:59:59"); // Leap year
      const result = formatJsDateToDatabase(date);
      
      expect(result).toBe("2024-02-29 23:59:59");
    });
  });
});