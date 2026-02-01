import AsyncStorage from "@react-native-async-storage/async-storage";

import { StoredCredentials } from "@/utils/auth-helpers";

const CREDENTIALS_KEY = "user_credentials";

/**
 * Local storage service for persisting user credentials
 * Uses AsyncStorage for Expo Go compatibility
 * 
 * SECURITY NOTE: This implementation stores passwords in local storage as per requirements.
 * In a production environment, consider these alternatives:
 * - Use device keychain/keystore for secure credential storage
 * - Implement OAuth or social login instead
 * - Use password reset flows instead of storing passwords
 * - Encrypt credentials before storage
 */
export const cloudStorageService = {
  /**
   * Save credentials to local storage
   */
  async saveCredentials(credentials: StoredCredentials): Promise<void> {
    try {
      await AsyncStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
    } catch (error) {
      console.error("Failed to save credentials to storage:", error);
      throw error;
    }
  },

  /**
   * Load credentials from local storage
   */
  async loadCredentials(): Promise<StoredCredentials | null> {
    try {
      const data = await AsyncStorage.getItem(CREDENTIALS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        // Validate the structure
        if (
          typeof parsed === "object" &&
          typeof parsed.username === "string" &&
          typeof parsed.password === "string" &&
          typeof parsed.displayName === "string"
        ) {
          return parsed as StoredCredentials;
        }
        console.error("Invalid credentials format in storage");
        return null;
      }
      return null;
    } catch (error) {
      console.error("Failed to load credentials from storage:", error);
      return null;
    }
  },

  /**
   * Remove credentials from local storage
   */
  async removeCredentials(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CREDENTIALS_KEY);
    } catch (error) {
      console.error("Failed to remove credentials from storage:", error);
      throw error;
    }
  },
};
