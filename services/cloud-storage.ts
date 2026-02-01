import { CloudStorage } from "react-native-cloud-storage";

import { StoredCredentials } from "@/utils/auth-helpers";

const CREDENTIALS_FILE = "credentials.json";

/**
 * Cloud storage service for persisting user credentials
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
        return JSON.parse(data) as StoredCredentials;
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
