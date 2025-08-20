import {
  useFonts,
  OpenSans_400Regular,
  OpenSans_500Medium,
  OpenSans_600SemiBold,
  OpenSans_700Bold,
  OpenSans_400Regular_Italic,
  OpenSans_500Medium_Italic,
  OpenSans_700Bold_Italic,
} from '@expo-google-fonts/open-sans';

/**
 * Font families available in the app
 */
export const fontFamilies = {
  // Open Sans - Clean and modern sans-serif
  openSans: {
    regular: 'OpenSans_400Regular',
    medium: 'OpenSans_500Medium',
    semiBold: 'OpenSans_600SemiBold',
    bold: 'OpenSans_700Bold',
    italicRegular: 'OpenSans_400Regular_Italic',
    italicMedium: 'OpenSans_500Medium_Italic',
    italicBold: 'OpenSans_700Bold_Italic',
  },
} as const;

/**
 * Hook to load all OpenSans Google Fonts
 * @returns Object with loading state and error state
 */
export const useGoogleFonts = () => {
  const [fontsLoaded, fontError] = useFonts({
    OpenSans_400Regular,
    OpenSans_500Medium,
    OpenSans_600SemiBold,
    OpenSans_700Bold,
    OpenSans_400Regular_Italic,
    OpenSans_500Medium_Italic,
    OpenSans_700Bold_Italic,
  });

  return { fontsLoaded, fontError };
};

/**
 * Default font family configuration
 */
export const defaultFonts = {
  regular: fontFamilies.openSans.regular,
  medium: fontFamilies.openSans.medium,
  semiBold: fontFamilies.openSans.semiBold,
  bold: fontFamilies.openSans.bold,
  italicRegular: fontFamilies.openSans.italicRegular,
  italicMedium: fontFamilies.openSans.italicMedium,
  italicBold: fontFamilies.openSans.italicBold,
} as const;
