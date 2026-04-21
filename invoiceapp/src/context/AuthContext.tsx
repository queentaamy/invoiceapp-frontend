import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type {
  AuthUser,
  AuthCredentials,
  SignupPayload,
  AuthProfile,
} from "../types";
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

function readStoredJson<T>(key: string): T | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function hydrateUserFromStorage(): AuthUser | null {
  const storedUser = readStoredJson<AuthUser>("invoiceflow_user");
  if (!storedUser) return null;

  const profile = readStoredJson<AuthProfile>("invoiceflow_profile");
  if (!profile) return storedUser;

  return {
    ...storedUser,
    id: profile.id ?? storedUser.id,
    email: profile.email ?? storedUser.email,
    name: profile.name ?? storedUser.name,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (DEMO_MODE) return demoUser;
    return hydrateUserFromStorage();
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (DEMO_MODE || !user?.token) return;

    let cancelled = false;

    void (async () => {
      try {
        const profile = await authService.getProfile();
        if (cancelled) return;

        localStorage.setItem("invoiceflow_profile", JSON.stringify(profile));

        setUser((prev) => {
          if (!prev) return prev;

          const mergedUser = {
            ...prev,
            id: profile.id ?? prev.id,
            email: profile.email ?? prev.email,
            name: profile.name ?? prev.name,
          };

          localStorage.setItem("invoiceflow_user", JSON.stringify(mergedUser));
          return mergedUser;
        });
      } catch {
        // Keep existing user state if profile refresh fails.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.token]);

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
      let nextUser = userData;

      try {
        const profile = await authService.getProfile();
        localStorage.setItem("invoiceflow_profile", JSON.stringify(profile));

        nextUser = {
          ...userData,
          id: profile.id ?? userData.id,
          email: profile.email ?? userData.email,
          name: profile.name ?? userData.name,
        };
      } catch {
        localStorage.removeItem("invoiceflow_profile");
      }

      setUser(nextUser);
      localStorage.setItem("invoiceflow_user", JSON.stringify(nextUser));
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
    } catch (error) {
      setUser(null);
      localStorage.removeItem("invoiceflow_user");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    localStorage.removeItem("invoiceflow_user");
    localStorage.removeItem("invoiceflow_profile");
    localStorage.removeItem("invoiceflow_customers");
    localStorage.removeItem("invoiceflow_invoices");
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
