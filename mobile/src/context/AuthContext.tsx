import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  clearAuthData,
  getStoredEmployee,
  getToken,
  saveAuthData,
} from "../services/storage.service";

import {
  setSessionExpiredHandler,
  clearSessionExpiredHandler,
} from "../services/authSession.service";

import { employeeLogin } from "../api/auth";
import { Employee } from "../types/auth";

interface AuthContextValue {
  token: string | null;
  employee: Employee | null;
  loading: boolean;
  employeeLogin: (
    employeeId: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined
  );

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [employee, setEmployee] =
    useState<Employee | null>(null);

  const [token, setToken] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  useEffect(() => {
    setSessionExpiredHandler(async () => {
      await clearAuthData();

      setToken(null);
      setEmployee(null);
    });

    return () => {
      clearSessionExpiredHandler();
    };
  }, []);

  async function loadStoredAuth() {
    try {
      const storedToken = await getToken();

      if (!storedToken) {
        return;
      }

      const storedEmployee =
        await getStoredEmployee<Employee>();

      setToken(storedToken);
      setEmployee(storedEmployee);
    } catch (error) {
      console.error(
        "Failed to load stored authentication:",
        error
      );

      await clearAuthData();
    } finally {
      setLoading(false);
    }
  }

  async function login(employeeId: string) {
    const result =
      await employeeLogin(employeeId);

    await saveAuthData(
      result.token,
      result.employee
    );

    setToken(result.token);
    setEmployee(result.employee);
  }

  async function logout() {
    await clearAuthData();

    setToken(null);
    setEmployee(null);
  }

  return (
    <AuthContext.Provider
      value={{
        employee,
        token,
        loading,
        employeeLogin: login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}