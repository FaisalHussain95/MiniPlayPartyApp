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

type AuthState = {
  token: string | null;
  user: User | null;
  isLoading: boolean;
};

type AuthContextValue = AuthState & {
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "auth_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    user: null,
    isLoading: true,
  });

  // Load token on mount
  useEffect(() => {
    (async () => {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        if (storedToken) {
          const user = await authApi.getUser(storedToken);
          setState({ token: storedToken, user, isLoading: false });
        } else {
          setState((s) => ({ ...s, isLoading: false }));
        }
      } catch {
        await AsyncStorage.removeItem(TOKEN_KEY);
        setState({ token: null, user: null, isLoading: false });
      }
    })();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const { token } = await authApi.login({ username, password });
    await AsyncStorage.setItem(TOKEN_KEY, token);
    const user = await authApi.getUser(token);
    setState({ token, user, isLoading: false });
  }, []);

  const register = useCallback(
    async (username: string, password: string, name: string) => {
      const { token } = await authApi.register({ username, password, name });
      await AsyncStorage.setItem(TOKEN_KEY, token);
      const user = await authApi.getUser(token);
      setState({ token, user, isLoading: false });
    },
    [],
  );

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setState({ token: null, user: null, isLoading: false });
  }, []);

  const value = useMemo(
    () => ({ ...state, login, register, logout }),
    [state, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
