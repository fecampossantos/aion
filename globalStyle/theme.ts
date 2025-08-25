/**
 * Centralized theme configuration for the Aion app
 * Contains all UI constants, colors, spacing, shadows, and design tokens
 */

// Color Palette
export const colors = {
  // Primary Colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main primary color
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Neutral Colors
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  
  // Success Colors
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981', // Main success color
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  
  // Warning Colors
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Main warning color
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  // Error Colors
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Main error color
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  // Legacy Black Colors (for backward compatibility)
  black: {
    light: '#363636',
    main: '#1C1C1C',
    dark: '#0A0A0A',
  },
  
  // White
  white: '#ffffff',
  
  // Transparent variants
  transparent: {
    white: {
      10: 'rgba(255, 255, 255, 0.1)',
      20: 'rgba(255, 255, 255, 0.2)',
      30: 'rgba(255, 255, 255, 0.3)',
      50: 'rgba(255, 255, 255, 0.5)',
      80: 'rgba(255, 255, 255, 0.8)',
    },
    black: {
      10: 'rgba(0, 0, 0, 0.1)',
      20: 'rgba(0, 0, 0, 0.2)',
      30: 'rgba(0, 0, 0, 0.3)',
      50: 'rgba(0, 0, 0, 0.5)',
      80: 'rgba(0, 0, 0, 0.8)',
    },
    primary: {
      10: 'rgba(59, 130, 246, 0.1)',
      20: 'rgba(59, 130, 246, 0.2)',
      30: 'rgba(59, 130, 246, 0.3)',
      50: 'rgba(59, 130, 246, 0.5)',
      80: 'rgba(59, 130, 246, 0.8)',
    },
  },
} as const;

// Spacing Scale
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
  '7xl': 80,
} as const;

// Border Radius Scale
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
} as const;

// Shadow Configurations
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 12,
    elevation: 12,
  },
} as const;

// Typography Scale
export const typography = {
  fontFamily: {
    regular: 'OpenSans_400Regular',
    medium: 'OpenSans_500Medium',
    semiBold: 'OpenSans_600SemiBold',
    bold: 'OpenSans_700Bold',
    italicRegular: 'OpenSans_400Regular_Italic',
    italicMedium: 'OpenSans_500Medium_Italic',
    italicBold: 'OpenSans_700Bold_Italic',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

// Component-specific theme constants
export const components = {
  card: {
    height: 72,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.neutral[800],
    ...shadows.lg,
  },
  button: {
    height: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  input: {
    height: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[600],
  },
  icon: {
    small: 16,
    medium: 20,
    large: 24,
    xl: 32,
  },
} as const;

// Layout constants
export const layout = {
  padding: {
    horizontal: spacing['2xl'],
    vertical: spacing.lg,
  },
  margin: {
    horizontal: spacing['2xl'],
    vertical: spacing.lg,
  },
  container: {
    maxWidth: 1200,
    padding: spacing.lg,
  },
} as const;

// Animation constants
export const animation = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
} as const;

// Z-index scale
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// Export the complete theme object
export const theme = {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
  components,
  layout,
  animation,
  zIndex,
} as const;

export default theme;
