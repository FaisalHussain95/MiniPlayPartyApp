import * as Crypto from "expo-crypto";

/**
 * Utility functions for seamless authentication
 */

/**
 * Generates a cryptographically secure random alphanumeric string of specified length
 */
async function generateRandomString(length: number): Promise<string> {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const randomBytes = await Crypto.getRandomBytesAsync(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomBytes[i] % chars.length);
  }
  return result;
}

/**
 * Sanitizes a display name to be alphanumeric only
 */
function sanitizeDisplayName(displayName: string): string {
  // Remove all non-alphanumeric characters
  return displayName.replace(/[^a-zA-Z0-9]/g, "");
}

/**
 * Generates a unique username from a display name
 * Format: sanitizedDisplayName + 8 random alphanumeric characters
 * Ensures: 3-30 characters, alphanumeric only
 */
export async function generateUsername(displayName: string): Promise<string> {
  const sanitized = sanitizeDisplayName(displayName);
  const randomSuffix = await generateRandomString(8);
  
  // Start with sanitized name (or default if empty)
  let base = sanitized || "user";
  
  // Ensure the base doesn't make the final username too long
  // We need room for the 8-char random suffix
  const maxBaseLength = 22; // 30 - 8 = 22
  if (base.length > maxBaseLength) {
    base = base.substring(0, maxBaseLength);
  }
  
  // Ensure the base is at least long enough
  // Minimum is 3, and we're adding 8, so base can be empty but let's ensure at least 1
  if (base.length === 0) {
    base = "u";
  }
  
  const username = base + randomSuffix;
  
  // Validate: should be 3-30 chars, alphanumeric
  if (username.length < 3 || username.length > 30 || !/^[a-zA-Z0-9]+$/.test(username)) {
    throw new Error("Generated username does not meet requirements");
  }
  
  return username;
}

/**
 * Generates a cryptographically secure random password
 * Ensures: 6-200 characters
 */
export async function generatePassword(): Promise<string> {
  // Generate a 32-character secure password
  // Using a mix of alphanumeric and special characters
  const length = 32;
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  
  const randomBytes = await Crypto.getRandomBytesAsync(length);
  let password = "";
  
  for (let i = 0; i < length; i++) {
    password += chars.charAt(randomBytes[i] % chars.length);
  }
  
  // Validate: should be 6-200 chars
  if (password.length < 6 || password.length > 200) {
    throw new Error("Generated password does not meet requirements");
  }
  
  return password;
}

/**
 * Credentials stored in cloud storage
 */
export type StoredCredentials = {
  username: string;
  password: string;
  displayName: string;
};
