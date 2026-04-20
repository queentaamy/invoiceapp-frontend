import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { AuthUser, AuthCredentials, SignupPayload } from "../types";
import { authService } from "../services/api";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: AuthCredentials) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_MODE = import.meta.env.VITE_ENABLE_DEMO_MODE === "true";

const demoUser: AuthUser = {
  id: 1,
  name: "Alex Johnson",
  email: "alex@invoiceflow.app",
  token: "demo-token",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (DEMO_MODE) return demoUser;
    const stored = localStorage.getItem("invoiceflow_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (credentials: AuthCredentials) => {
    if (DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 800));
      setUser(demoUser);
      localStorage.setItem("invoiceflow_user", JSON.stringify(demoUser));
      return;
    }
    setIsLoading(true);
    try {
      const userData = await authService.login(credentials);
      setUser(userData);
      localStorage.setItem("invoiceflow_user", JSON.stringify(userData));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (payload: SignupPayload) => {
    if (DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 800));
      const newUser = { ...demoUser, name: payload.name, email: payload.email };
      setUser(newUser);
      localStorage.setItem("invoiceflow_user", JSON.stringify(newUser));
      return;
    }
    setIsLoading(true);
    try {
      const userData = await authService.signup(payload);
      setUser(userData);
      localStorage.setItem("invoiceflow_user", JSON.stringify(userData));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    localStorage.removeItem("invoiceflow_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
