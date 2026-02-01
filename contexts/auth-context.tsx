import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import { authApi, User } from "@/services/api";
import { credentialStorageService } from "@/services/credential-storage";
import { generatePassword, generateUsername, StoredCredentials } from "@/utils/auth-helpers";

type AuthState = {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  storedCredentials: StoredCredentials | null;
};

type AuthContextValue = AuthState & {
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, name: string) => Promise<void>;
  seamlessRegister: (displayName: string) => Promise<void>;
  restoreFromCloud: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "auth_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    user: null,
    isLoading: true,
    storedCredentials: null,
  });

  // Load token on mount and check for cloud credentials
  useEffect(() => {
    (async () => {
      try {
        // First check for stored token
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        if (storedToken) {
          const user = await authApi.getUser(storedToken);
          setState({ token: storedToken, user, isLoading: false, storedCredentials: null });
        } else {
          // Check if there are credentials in cloud storage
          const cloudCreds = await credentialStorageService.loadCredentials();
          setState((s) => ({ ...s, isLoading: false, storedCredentials: cloudCreds }));
        }
      } catch {
        await AsyncStorage.removeItem(TOKEN_KEY);
        // Still try to load cloud credentials even if token auth failed
        const cloudCreds = await credentialStorageService.loadCredentials();
        setState({ token: null, user: null, isLoading: false, storedCredentials: cloudCreds });
      }
    })();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const { token } = await authApi.login({ username, password });
    await AsyncStorage.setItem(TOKEN_KEY, token);
    const user = await authApi.getUser(token);
    setState({ token, user, isLoading: false, storedCredentials: null });
  }, []);

  const register = useCallback(
    async (username: string, password: string, name: string) => {
      const { token } = await authApi.register({ username, password, name });
      await AsyncStorage.setItem(TOKEN_KEY, token);
      const user = await authApi.getUser(token);
      setState({ token, user, isLoading: false, storedCredentials: null });
    },
    [],
  );

  /**
   * Seamless registration - only requires display name
   * Generates username and password automatically
   */
  const seamlessRegister = useCallback(
    async (displayName: string) => {
      let success = false;
      let attempts = 0;
      const maxAttempts = 5;

      while (!success && attempts < maxAttempts) {
        attempts++;
        try {
          const username = await generateUsername(displayName);
          const password = await generatePassword();

          // Try to register with generated credentials
          const { token } = await authApi.register({ username, password, name: displayName });
          
          // Save credentials to cloud storage
          await credentialStorageService.saveCredentials({
            username,
            password,
            displayName,
          });

          // Save token and get user
          await AsyncStorage.setItem(TOKEN_KEY, token);
          const user = await authApi.getUser(token);
          setState({ token, user, isLoading: false, storedCredentials: null });
          
          success = true;
        } catch (error) {
          // Check if it's a username conflict error
          const errorMessage = error instanceof Error ? error.message : String(error);
          const isUsernameConflict = 
            errorMessage.toLowerCase().includes("username") &&
            (errorMessage.toLowerCase().includes("taken") ||
             errorMessage.toLowerCase().includes("exists") ||
             errorMessage.toLowerCase().includes("already"));
          
          // Only retry for username conflicts
          if (isUsernameConflict && attempts < maxAttempts) {
            // Loop will try again with new username
            continue;
          }
          
          // For other errors or max attempts reached, throw
          if (attempts >= maxAttempts) {
            throw new Error("Failed to create account after multiple attempts. Please try again.");
          } else {
            throw error; // Re-throw non-username-conflict errors
          }
        }
      }
    },
    [],
  );

  /**
   * Restore account from cloud storage credentials
   */
  const restoreFromCloud = useCallback(async () => {
    const creds = state.storedCredentials;
    if (!creds) {
      throw new Error("No stored credentials found");
    }

    // Login with stored credentials
    const { token } = await authApi.login({
      username: creds.username,
      password: creds.password,
    });
    await AsyncStorage.setItem(TOKEN_KEY, token);
    const user = await authApi.getUser(token);
    setState({ token, user, isLoading: false, storedCredentials: null });
  }, [state.storedCredentials]);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    // Keep stored credentials in cloud storage for future restoration
    setState({ token: null, user: null, isLoading: false, storedCredentials: state.storedCredentials });
  }, [state.storedCredentials]);

  const value = useMemo(
    () => ({ ...state, login, register, seamlessRegister, restoreFromCloud, logout }),
    [state, login, register, seamlessRegister, restoreFromCloud, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
