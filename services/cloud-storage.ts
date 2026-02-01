import CloudStorage from "react-native-cloud-storage";

import { StoredCredentials } from "@/utils/auth-helpers";

const CREDENTIALS_KEY = "user_credentials";

/**
 * Cloud storage service for persisting user credentials
 */
export const cloudStorageService = {
  /**
   * Save credentials to cloud storage
   */
  async saveCredentials(credentials: StoredCredentials): Promise<void> {
    try {
      await CloudStorage.set(CREDENTIALS_KEY, JSON.stringify(credentials));
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
      const data = await CloudStorage.get(CREDENTIALS_KEY);
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
      await CloudStorage.remove(CREDENTIALS_KEY);
    } catch (error) {
      console.error("Failed to remove credentials from cloud storage:", error);
      throw error;
    }
  },
};
