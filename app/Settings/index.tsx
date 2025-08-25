import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { Entypo } from "@expo/vector-icons";
import { theme } from "../../globalStyle/theme";
import appConfig from "../../app.json";
import { SettingsLayoutWrapper } from "./_layout";
import { useState } from "react";
import {
  BackupModal,
  RestoreModal,
  RestoreConfirmationModal,
} from "../../components/Modal";
import { useSQLiteContext } from "expo-sqlite";
import {
  downloadBackup,
  restoreFromSelectedFile,
  getBackupStats,
} from "../../utils/backupUtils";
import { useToast } from "../../components/Toast/ToastContext";
import { Linking } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

/**
 * Settings page component that displays various app configuration options
 * @returns The settings page component
 */
const Settings = () => {
  const database = useSQLiteContext();
  const { showToast } = useToast();
  const { t, i18n } = useTranslation();
  const [isBackingUp, setIsBackingUp] = useState<boolean>(false);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);

  // Modal states
  const [showBackupModal, setShowBackupModal] = useState<boolean>(false);
  const [showRestoreModal, setShowRestoreModal] = useState<boolean>(false);
  const [showRestoreConfirmationModal, setShowRestoreConfirmationModal] =
    useState<boolean>(false);
  const [restoreBackupInfo, setRestoreBackupInfo] = useState<{
    date: string;
    projectCount: number;
    taskCount: number;
    timingCount: number;
  }>({ date: "", projectCount: 0, taskCount: 0, timingCount: 0 });

  /**
   * Handles creating and sharing a backup of all data
   */
  const handleBackupData = () => {
    setShowBackupModal(true);
  };

  /**
   * Handles backup confirmation
   */
  const handleBackupConfirm = async () => {
    setShowBackupModal(false);
    setIsBackingUp(true);
          try {
        await downloadBackup(database);
        // Show success toast
        showToast(t("backup.success"), "success");
      } catch (error) {
      // Error handling is done in downloadBackup function
      console.error("Backup error:", error);
    } finally {
      setIsBackingUp(false);
    }
  };

  /**
   * Handles restoring data from a backup file
   */
  const handleRestoreData = () => {
    setShowRestoreModal(true);
  };

  /**
   * Handles restore confirmation
   */
  const handleRestoreConfirm = async () => {
    setShowRestoreModal(false);
    setIsRestoring(true);
    try {
      const backupInfo = await restoreFromSelectedFile(database);
      // Set backup info for confirmation modal
      setRestoreBackupInfo(backupInfo);
      setShowRestoreConfirmationModal(true);
      setIsRestoring(false);
    } catch (error) {
      // Error handling is done in restoreFromSelectedFile function
      console.error("Restore error:", error);
      setIsRestoring(false);
    }
  };

  /**
   * Handles final restore confirmation
   */
  const handleFinalRestoreConfirm = async () => {
    setShowRestoreConfirmationModal(false);
    setIsRestoring(true);
    try {
      // The actual restore was already done, just show success message
      showToast(
        t("restore.restoreMessage", {
          projects: restoreBackupInfo.projectCount,
          tasks: restoreBackupInfo.taskCount,
          timings: restoreBackupInfo.timingCount,
        }),
        "success"
      );
    } catch (error) {
      console.error("Restore error:", error);
    } finally {
      setIsRestoring(false);
    }
  };

  /**
   * Renders a settings section with title and options
   */
  const renderSettingsSection = (
    title: string,
    options: Array<{
      id: string;
      title: string;
      subtitle?: string;
      icon: keyof typeof Entypo.glyphMap;
      onPress: () => void;
      loading?: boolean;
    }>
  ) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <Pressable
            key={option.id}
            style={styles.optionItem}
            onPress={option.onPress}
            testID={`settings-option-${option.id}`}
            disabled={option.loading}
          >
            <View style={styles.optionIconContainer}>
              {option.loading ? (
                <Entypo
                  name="cycle"
                  size={theme.components.icon.medium}
                  color={theme.colors.primary[500]}
                />
              ) : (
                <Entypo
                  name={option.icon}
                  size={theme.components.icon.medium}
                  color={theme.colors.primary[500]}
                />
              )}
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>
                {option.loading
                  ? option.id === "backup"
                    ? t("settings.creating")
                    : t("settings.restoring")
                  : option.title}
              </Text>
              {option.subtitle && (
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              )}
            </View>
            <View style={styles.optionArrow}>
              <Entypo
                name="chevron-right"
                size={theme.components.icon.small}
                color={theme.colors.neutral[400]}
              />
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <SettingsLayoutWrapper>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* App Information Section */}
        <View style={styles.appInfoSection}>
          <Text style={styles.appName}>{t("app.name")}</Text>
          <Text style={styles.appVersion}>{t("app.version", { version: appConfig.expo.version })}</Text>
        </View>

        {/* General Settings */}
        {renderSettingsSection(t("settings.general"), [
          {
            id: "language",
            title: t("settings.language"),
            subtitle: t("settings.currentLanguage"),
            icon: "language",
            onPress: () => router.push("/Language"),
          },
          {
            id: "pdfTemplates",
            title: t("settings.pdfTemplates"),
            subtitle: t("settings.pdfTemplatesSubtitle"),
            icon: "text-document",
            onPress: () => router.push("/PDFTemplates"),
          },
        ])}

        {/* Data Management */}
        {renderSettingsSection(t("settings.dataManagement"), [
          {
            id: "backup",
            title: t("settings.backup"),
            subtitle: t("settings.backupSubtitle"),
            icon: "download",
            onPress: handleBackupData,
            loading: isBackingUp,
          },
          {
            id: "restore",
            title: t("settings.restore"),
            subtitle: t("settings.restoreSubtitle"),
            icon: "upload",
            onPress: handleRestoreData,
            loading: isRestoring,
          },
        ])}

        {/* Support Section */}
        {renderSettingsSection(t("settings.support"), [
          {
            id: "github",
            title: t("settings.github"),
            subtitle: t("settings.githubSubtitle"),
            icon: "code",
            onPress: () => {
              // Open GitHub repository
              Linking.openURL("https://github.com/fecampossantos/aion");
            },
          },
        ])}
      </ScrollView>

      {/* Backup Modal */}
      <BackupModal
        visible={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        onConfirm={handleBackupConfirm}
        isLoading={isBackingUp}
      />

      {/* Restore Modal */}
      <RestoreModal
        visible={showRestoreModal}
        onClose={() => setShowRestoreModal(false)}
        onConfirm={handleRestoreConfirm}
        isLoading={isRestoring}
      />

      {/* Restore Confirmation Modal */}
      <RestoreConfirmationModal
        visible={showRestoreConfirmationModal}
        onClose={() => setShowRestoreConfirmationModal(false)}
        onConfirm={handleFinalRestoreConfirm}
        backupInfo={restoreBackupInfo}
        isLoading={isRestoring}
      />
    </SettingsLayoutWrapper>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: theme.spacing["4xl"],
  },
  appInfoSection: {
    alignItems: "center",
    paddingVertical: theme.spacing["3xl"],
    paddingHorizontal: theme.spacing["2xl"],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[700],
  },
  appName: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize["2xl"],
    marginBottom: theme.spacing.xs,
  },
  appVersion: {
    color: theme.colors.neutral[400],
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
  },
  section: {
    marginTop: theme.spacing["2xl"],
    paddingHorizontal: theme.spacing["2xl"],
  },
  sectionTitle: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.lg,
    marginBottom: theme.spacing.md,
    letterSpacing: 0.5,
  },
  optionsContainer: {
    backgroundColor: theme.colors.neutral[800],
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[700],
  },
  optionIconContainer: {
    width: theme.spacing["4xl"],
    height: theme.spacing["4xl"],
    borderRadius: theme.spacing["4xl"] / 2,
    backgroundColor: theme.colors.transparent.white[10],
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.md,
    marginBottom: theme.spacing.xs,
  },
  optionSubtitle: {
    color: theme.colors.neutral[400],
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
  },
  optionArrow: {
    marginLeft: theme.spacing.sm,
  },
});

export default Settings;
