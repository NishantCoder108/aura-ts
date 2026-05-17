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
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);

  async function refreshSession() {
    try {
      const response = await api.getSession();
      setUser(response.user);
      setStatus("authenticated");
    } catch {
      setUser(null);
      setStatus("guest");
    }
  }

  async function login(payload: { identifier: string; password: string }) {
    const response = await api.login(payload);
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
    setUser(response.user);
    setStatus("authenticated");
  }

  async function logout() {
    await api.logout();
    setUser(null);
    setStatus("guest");
  }

  useEffect(() => {
    let isMounted = true;

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
