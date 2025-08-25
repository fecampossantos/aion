import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { Entypo } from "@expo/vector-icons";
import { theme } from "../../globalStyle/theme";
import { PDFTemplatesLayoutWrapper } from "./_layout";
import { useState, useEffect } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { useToast } from "../../components/Toast/ToastContext";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { 
  PDF_TEMPLATES, 
  PDFTemplate, 
  PDFTemplateType 
} from "../../interfaces/UserPreferences";
import { 
  getPDFTemplatePreference, 
  setPDFTemplatePreference 
} from "../../utils/preferencesUtils";
import Content from "../../components/Content";

/**
 * PDF Templates selection page component
 * @returns The PDF templates selection page component
 */
const PDFTemplates = () => {
  const database = useSQLiteContext();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [selectedTemplate, setSelectedTemplate] = useState<PDFTemplateType>('dark');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  /**
   * Load the current PDF template preference
   */
  useEffect(() => {
    loadCurrentTemplate();
  }, []);

  /**
   * Load current template preference from database
   */
  const loadCurrentTemplate = async () => {
    try {
      const currentTemplate = await getPDFTemplatePreference(database);
      setSelectedTemplate(currentTemplate);
    } catch (error) {
      console.error('Error loading template preference:', error);
      showToast(t("templates.loadError"), "error");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle template selection
   */
  const handleTemplateSelect = (templateType: PDFTemplateType) => {
    setSelectedTemplate(templateType);
  };

  /**
   * Save template preference
   */
  const handleSaveTemplate = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      await setPDFTemplatePreference(database, selectedTemplate);
      showToast(t("templates.saveSuccess"), "success");
      
      // Navigate back after a short delay
      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (error) {
      console.error('Error saving template preference:', error);
      showToast(t("templates.saveError"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Render template option card
   */
  const renderTemplateOption = (template: PDFTemplate) => {
    const isSelected = selectedTemplate === template.id;
    
    return (
      <Pressable
        key={template.id}
        style={[
          styles.templateCard,
          isSelected && styles.templateCardSelected
        ]}
        onPress={() => handleTemplateSelect(template.id)}
        testID={`template-${template.id}`}
      >
        <View style={styles.templateHeader}>
          <View style={styles.templateIconContainer}>
            <Entypo
              name={template.id === 'dark' ? 'moon' : 'light-up'}
              size={theme.components.icon.medium}
              color={isSelected ? theme.colors.primary[500] : theme.colors.neutral[400]}
            />
          </View>
          <View style={styles.templateInfo}>
            <Text style={[styles.templateName, isSelected && styles.templateNameSelected]}>
              {template.name}
            </Text>
            <Text style={styles.templateDescription}>
              {template.description}
            </Text>
            {template.isDefault && (
              <Text style={styles.defaultBadge}>
                {t("templates.default")}
              </Text>
            )}
          </View>
          <View style={styles.selectionIndicator}>
            {isSelected ? (
              <Entypo
                name="check"
                size={theme.components.icon.small}
                color={theme.colors.primary[500]}
              />
            ) : (
              <View style={styles.unselectedCircle} />
            )}
          </View>
        </View>
        
        {/* Template preview */}
        <View style={[
          styles.templatePreview,
          template.id === 'light' ? styles.lightPreview : styles.darkPreview
        ]}>
          <View style={[
            styles.previewHeader,
            template.id === 'light' ? styles.lightPreviewHeader : styles.darkPreviewHeader
          ]}>
            <Text style={[
              styles.previewTitle,
              template.id === 'light' ? styles.lightPreviewTitle : styles.darkPreviewTitle
            ]}>
              Relatório de Produtividade
            </Text>
          </View>
          <View style={styles.previewContent}>
            <View style={[
              styles.previewCard,
              template.id === 'light' ? styles.lightPreviewCard : styles.darkPreviewCard
            ]} />
            <View style={[
              styles.previewCard,
              template.id === 'light' ? styles.lightPreviewCard : styles.darkPreviewCard
            ]} />
          </View>
        </View>
      </Pressable>
    );
  };

  if (isLoading) {
    return (
      <PDFTemplatesLayoutWrapper>
        <Content.Wrapper>
                  <Content.Header 
          left={<Content.BackButton onPress={router.back} />}
          title={t("templates.title")}
        />
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>{t("templates.loading")}</Text>
          </View>
        </Content.Wrapper>
      </PDFTemplatesLayoutWrapper>
    );
  }

  return (
    <PDFTemplatesLayoutWrapper>
      <Content.Wrapper>
        <Content.Header 
          left={<Content.BackButton onPress={router.back} />}
          title={t("templates.title")}
        />
        
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {PDF_TEMPLATES.map(renderTemplateOption)}
          
          {/* Save Button */}
          <View style={styles.saveButtonContainer}>
            <Pressable
              style={[
                styles.saveButton,
                isSaving && styles.saveButtonDisabled
              ]}
              onPress={handleSaveTemplate}
              disabled={isSaving}
              testID="save-template-button"
            >
              <Entypo
                name={isSaving ? "cycle" : "check"}
                size={theme.components.icon.small}
                color={theme.colors.white}
                style={styles.saveButtonIcon}
              />
              <Text style={styles.saveButtonText}>
                {isSaving ? t("templates.saving") : t("templates.save")}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </Content.Wrapper>
    </PDFTemplatesLayoutWrapper>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: theme.spacing["4xl"],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing["4xl"],
  },
  loadingText: {
    color: theme.colors.neutral[400],
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.md,
  },
  templateCard: {
    backgroundColor: theme.colors.neutral[800],
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: "transparent",
  },
  templateCardSelected: {
    borderColor: theme.colors.primary[500],
    backgroundColor: theme.colors.transparent.primary[10],
  },
  templateHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  templateIconContainer: {
    width: theme.spacing["3xl"],
    height: theme.spacing["3xl"],
    borderRadius: theme.spacing["3xl"] / 2,
    backgroundColor: theme.colors.transparent.white[10],
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.lg,
    marginBottom: theme.spacing.xs,
  },
  templateNameSelected: {
    color: theme.colors.primary[400],
  },
  templateDescription: {
    color: theme.colors.neutral[400],
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: theme.typography.fontSize.sm * 1.4,
  },
  defaultBadge: {
    color: theme.colors.success[400],
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: theme.spacing.xs,
  },
  selectionIndicator: {
    width: theme.spacing.lg,
    height: theme.spacing.lg,
    borderRadius: theme.spacing.lg / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  unselectedCircle: {
    width: theme.spacing.md,
    height: theme.spacing.md,
    borderRadius: theme.spacing.md / 2,
    borderWidth: 1,
    borderColor: theme.colors.neutral[400],
  },
  templatePreview: {
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
    height: 120,
  },
  lightPreview: {
    backgroundColor: "#ffffff",
  },
  darkPreview: {
    backgroundColor: "#0f172a",
  },
  previewHeader: {
    padding: theme.spacing.sm,
    alignItems: "center",
  },
  lightPreviewHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  darkPreviewHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  previewTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.xs,
  },
  lightPreviewTitle: {
    color: "#0f172a",
  },
  darkPreviewTitle: {
    color: "#ffffff",
  },
  previewContent: {
    padding: theme.spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  previewCard: {
    width: "45%",
    height: 32,
    borderRadius: theme.borderRadius.sm,
  },
  lightPreviewCard: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  darkPreviewCard: {
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
  },
  saveButtonContainer: {
    marginTop: theme.spacing["2xl"],
    paddingHorizontal: theme.spacing.lg,
  },
  saveButton: {
    backgroundColor: theme.colors.primary[500],
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing["2xl"],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonDisabled: {
    backgroundColor: theme.colors.neutral[600],
  },
  saveButtonIcon: {
    marginRight: theme.spacing.sm,
  },
  saveButtonText: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.md,
  },
});

export default PDFTemplates;