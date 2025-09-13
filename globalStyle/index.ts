// Legacy color constants for backward compatibility
const eerie_black = "#1C1C1C";
const jet_black = "#363636";
const night_black = "#0A0A0A";

const globalStyle = {
  black: {
    light: jet_black,
    main: eerie_black,
    dark: night_black,
  },
  background: eerie_black,
  white: "#ffffff",
  error: "#ef4444", // Error color from theme
  font: {
    regular: "OpenSans_400Regular",
    medium: "OpenSans_500Medium",
    semiBold: "OpenSans_600SemiBold",
    bold: "OpenSans_700Bold",
    italicRegular: "OpenSans_400Regular_Italic",
    italicMedium: "OpenSans_500Medium_Italic",
    italicBold: "OpenSans_700Bold_Italic",
  },
  padding:{
    horizontal: 24
  }
};

// Export the new theme system
export { default as theme } from './theme';
export { colors, spacing, borderRadius, shadows, typography, components, layout, animation, zIndex } from './theme';

// Export legacy globalStyle for backward compatibility
export default globalStyle;
