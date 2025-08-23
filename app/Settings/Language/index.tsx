import { View, Text, Pressable, StyleSheet } from "react-native";
import { Entypo } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { theme } from "../../../globalStyle/theme";
import { SettingsLayoutWrapper } from "../_layout";

/**
 * Language selection page component
 */
const LanguageSelection = () => {
  const { t, i18n } = useTranslation();

  const languages = [
    {
      code: 'en',
      name: t('languageSelection.english'),
      flag: '🇺🇸',
    },
    {
      code: 'pt',
      name: t('languageSelection.portuguese'),
      flag: '🇧🇷',
    },
  ];

  /**
   * Handles language selection
   */
  const handleLanguageSelect = async (languageCode: string) => {
    await i18n.changeLanguage(languageCode);
    router.back();
  };

  /**
   * Gets the display name for the current language
   */
  const getCurrentLanguageName = () => {
    const currentLang = languages.find(lang => lang.code === i18n.language);
    return currentLang ? currentLang.name : 'Unknown';
  };

  return (
    <SettingsLayoutWrapper>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            testID="back-button"
          >
            <Entypo
              name="chevron-left"
              size={theme.components.icon.medium}
              color={theme.colors.white}
            />
          </Pressable>
          <Text style={styles.headerTitle}>{t('languageSelection.title')}</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.subtitle}>{t('languageSelection.subtitle')}</Text>
          
          <Text style={styles.currentLanguage}>
            {t('languageSelection.currentLanguage', { language: getCurrentLanguageName() })}
          </Text>

          {/* Language Options */}
          <View style={styles.languageList}>
            {languages.map((language) => (
              <Pressable
                key={language.code}
                style={[
                  styles.languageOption,
                  i18n.language === language.code && styles.selectedLanguageOption
                ]}
                onPress={() => handleLanguageSelect(language.code)}
                testID={`language-option-${language.code}`}
              >
                <View style={styles.languageContent}>
                  <Text style={styles.languageFlag}>{language.flag}</Text>
                  <Text style={styles.languageName}>{language.name}</Text>
                </View>
                {i18n.language === language.code && (
                  <Entypo
                    name="check"
                    size={theme.components.icon.medium}
                    color={theme.colors.primary[500]}
                  />
                )}
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </SettingsLayoutWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[700],
  },
  backButton: {
    marginRight: theme.spacing.md,
    padding: theme.spacing.xs,
  },
  headerTitle: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.lg,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing["2xl"],
    paddingTop: theme.spacing["2xl"],
  },
  subtitle: {
    color: theme.colors.neutral[300],
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.md,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  currentLanguage: {
    color: theme.colors.primary[400],
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.sm,
    marginBottom: theme.spacing["2xl"],
    textAlign: 'center',
  },
  languageList: {
    gap: theme.spacing.md,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.neutral[800],
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedLanguageOption: {
    borderColor: theme.colors.primary[500],
    backgroundColor: theme.colors.transparent.primary[10],
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageFlag: {
    fontSize: theme.typography.fontSize["2xl"],
    marginRight: theme.spacing.md,
  },
  languageName: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.md,
  },
});

export default LanguageSelection;