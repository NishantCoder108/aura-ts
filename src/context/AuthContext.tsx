/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";

import * as api from "@/lib/api";
import type { AuthStatus, User } from "@/lib/types";

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  login: (payload: { identifier: string; password: string }) => Promise<void>;
  signup: (payload: {
    firstName: string;
    email: string;
    username: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>(() =>
    api.getAuthToken() ? "loading" : "guest",
  );
  const [user, setUser] = useState<User | null>(null);

  async function refreshSession() {
    try {
      if (!api.getAuthToken()) {
        setUser(null);
        setStatus("guest");
        return;
      }

      const response = await api.getSession();
      setUser(response.user);
      setStatus("authenticated");
    } catch {
      api.clearAuthToken();
      setUser(null);
      setStatus("guest");
    }
  }

  async function login(payload: { identifier: string; password: string }) {
    const response = await api.login(payload);
    if (response.token) {
      api.setAuthToken(response.token);
    }
    setUser(response.user);
    setStatus("authenticated");
  }

  async function signup(payload: {
    firstName: string;
    email: string;
    username: string;
    password: string;
  }) {
    const response = await api.signup(payload);
    if (response.token) {
      api.setAuthToken(response.token);
    }
    setUser(response.user);
    setStatus("authenticated");
  }

  async function logout() {
    await api.logout();
    api.clearAuthToken();
    setUser(null);
    setStatus("guest");
  }

  useEffect(() => {
    let isMounted = true;

    if (!api.getAuthToken()) {
      return;
    }

    void api
      .getSession()
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setUser(response.user);
        setStatus("authenticated");
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        api.clearAuthToken();
        setUser(null);
        setStatus("guest");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ status, user, login, signup, logout, refreshSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
