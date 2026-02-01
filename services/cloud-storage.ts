import { CloudStorage } from "react-native-cloud-storage";

import { StoredCredentials } from "@/utils/auth-helpers";

const CREDENTIALS_FILE = "credentials.json";

/**
 * Cloud storage service for persisting user credentials
 * 
 * SECURITY NOTE: This implementation stores passwords in cloud storage as per requirements.
 * In a production environment, consider these alternatives:
 * - Use device keychain/keystore for secure credential storage
 * - Implement OAuth or social login instead
 * - Use password reset flows instead of storing passwords
 * - Encrypt credentials before cloud storage
 */
export const cloudStorageService = {
  /**
   * Save credentials to cloud storage
   */
  async saveCredentials(credentials: StoredCredentials): Promise<void> {
    try {
      await CloudStorage.writeFile(CREDENTIALS_FILE, JSON.stringify(credentials));
    } catch (error) {
      console.error("Failed to save credentials to cloud storage:", error);
      throw error;
    }
  },

  /**
   * Load credentials from cloud storage
   */
  async loadCredentials(): Promise<StoredCredentials | null> {
    try {
      const exists = await CloudStorage.exists(CREDENTIALS_FILE);
      if (!exists) {
        return null;
      }
      const data = await CloudStorage.readFile(CREDENTIALS_FILE);
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
        console.error("Invalid credentials format in cloud storage");
        return null;
      }
      return null;
    } catch (error) {
      console.error("Failed to load credentials from cloud storage:", error);
      return null;
    }
  },

  /**
   * Remove credentials from cloud storage
   */
  async removeCredentials(): Promise<void> {
    try {
      await CloudStorage.unlink(CREDENTIALS_FILE);
    } catch (error) {
      console.error("Failed to remove credentials from cloud storage:", error);
      throw error;
    }
  },
};
