import { SQLiteDatabase } from 'expo-sqlite';
import { UserPreferences, PreferenceKeys, DEFAULT_PREFERENCES, PDFTemplateType } from '../interfaces/UserPreferences';

/**
 * Get a user preference value by key
 * @param db - SQLite database instance
 * @param key - The preference key to retrieve
 * @returns Promise<string | null> - The preference value or null if not found
 */
export async function getUserPreference(
  db: SQLiteDatabase, 
  key: PreferenceKeys
): Promise<string | null> {
  try {
    const result = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM user_preferences WHERE key = ?;",
      key
    );
    return result?.value || null;
  } catch (error) {
    console.error('Error getting user preference:', error);
    return null;
  }
}

/**
 * Set a user preference value
 * @param db - SQLite database instance  
 * @param key - The preference key to set
 * @param value - The preference value to set
 * @returns Promise<void>
 */
export async function setUserPreference(
  db: SQLiteDatabase,
  key: PreferenceKeys,
  value: string
): Promise<void> {
  try {
    await db.runAsync(
      `INSERT OR REPLACE INTO user_preferences (key, value, updated_at) 
       VALUES (?, ?, CURRENT_TIMESTAMP);`,
      key,
      value
    );
  } catch (error) {
    console.error('Error setting user preference:', error);
    throw new Error('Failed to save preference');
  }
}

/**
 * Get the user's preferred PDF template
 * @param db - SQLite database instance
 * @returns Promise<PDFTemplateType> - The preferred PDF template type
 */
export async function getPDFTemplatePreference(db: SQLiteDatabase): Promise<PDFTemplateType> {
  try {
    const template = await getUserPreference(db, PreferenceKeys.PDF_TEMPLATE);
    if (template && (template === 'dark' || template === 'light')) {
      return template as PDFTemplateType;
    }
    return DEFAULT_PREFERENCES[PreferenceKeys.PDF_TEMPLATE];
  } catch (error) {
    console.error('Error getting PDF template preference:', error);
    return DEFAULT_PREFERENCES[PreferenceKeys.PDF_TEMPLATE];
  }
}

/**
 * Set the user's preferred PDF template
 * @param db - SQLite database instance
 * @param template - The PDF template type to set
 * @returns Promise<void>
 */
export async function setPDFTemplatePreference(
  db: SQLiteDatabase,
  template: PDFTemplateType
): Promise<void> {
  try {
    await setUserPreference(db, PreferenceKeys.PDF_TEMPLATE, template);
  } catch (error) {
    console.error('Error setting PDF template preference:', error);
    throw error;
  }
}

/**
 * Get all user preferences
 * @param db - SQLite database instance
 * @returns Promise<UserPreferences[]> - Array of all user preferences
 */
export async function getAllUserPreferences(db: SQLiteDatabase): Promise<UserPreferences[]> {
  try {
    const preferences = await db.getAllAsync<UserPreferences>(
      "SELECT * FROM user_preferences ORDER BY key;"
    );
    return preferences || [];
  } catch (error) {
    console.error('Error getting all user preferences:', error);
    return [];
  }
}

/**
 * Initialize default preferences if they don't exist
 * @param db - SQLite database instance
 * @returns Promise<void>
 */
export async function initializeDefaultPreferences(db: SQLiteDatabase): Promise<void> {
  try {
    // Check if preferences exist, if not create them
    for (const [key, defaultValue] of Object.entries(DEFAULT_PREFERENCES)) {
      const existing = await getUserPreference(db, key as PreferenceKeys);
      if (!existing) {
        await setUserPreference(db, key as PreferenceKeys, defaultValue);
      }
    }
  } catch (error) {
    console.error('Error initializing default preferences:', error);
    throw error;
  }
}