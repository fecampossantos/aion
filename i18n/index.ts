import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import pt from './locales/pt.json';

const LANGUAGE_STORAGE_KEY = 'user_language';

const resources = {
  en: {
    translation: en,
  },
  pt: {
    translation: pt,
  },
};

// Function to get stored language or fallback to system/default
const getInitialLanguage = async (): Promise<string> => {
  try {
    const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (storedLanguage && Object.keys(resources).includes(storedLanguage)) {
      return storedLanguage;
    }
    
    // Check if system language is supported
    const systemLanguage = Localization.getLocales()[0]?.languageCode || 'en';
    if (Object.keys(resources).includes(systemLanguage)) {
      return systemLanguage;
    }
    
    // Fallback to English
    return 'en';
  } catch {
    return 'en';
  }
};

// Initialize i18n
const initI18n = async () => {
  const initialLanguage = await getInitialLanguage();
  
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: initialLanguage,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    });

  // Save language preference when it changes
  i18n.on('languageChanged', (lng) => {
    AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
  });
};

// Initialize i18n immediately
initI18n();

export default i18n;