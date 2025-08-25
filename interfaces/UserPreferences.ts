/**
 * Interface for user preferences in the application
 */
export interface UserPreferences {
  preference_id: number;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

/**
 * Available PDF template types
 */
export type PDFTemplateType = 'dark' | 'light';

/**
 * PDF template configuration interface
 */
export interface PDFTemplate {
  id: PDFTemplateType;
  name: string;
  description: string;
  isDefault?: boolean;
}

/**
 * User preference keys used in the application
 */
export enum PreferenceKeys {
  PDF_TEMPLATE = 'pdf_template'
}

/**
 * Default user preferences
 */
export const DEFAULT_PREFERENCES = {
  [PreferenceKeys.PDF_TEMPLATE]: 'dark' as PDFTemplateType
};

/**
 * Available PDF templates
 */
export const PDF_TEMPLATES: PDFTemplate[] = [
  {
    id: 'dark',
    name: 'Dark Mode',
    description: 'Professional dark theme with blue accents',
    isDefault: true
  },
  {
    id: 'light',
    name: 'Light Mode', 
    description: 'Clean light theme for better printing'
  }
];