import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { adminLogin } from "../api/admin";
import {
  clearAdminAuth,
  getAdminToken,
  getStoredAdmin,
  saveAdminAuth,
} from "../services/adminStorage.services";
import { Admin } from "../types/admin";

interface AdminAuthContextValue {
  token: string | null;
  admin: Admin | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext =
  createContext<AdminAuthContextValue | undefined>(
    undefined
  );

interface AdminAuthProviderProps {
  children: ReactNode;
}

export function AdminAuthProvider({
  children,
}: AdminAuthProviderProps) {
  const [token, setToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAdmin();
  }, []);

  const loadStoredAdmin = async () => {
    try {
      const [storedToken, storedAdmin] =
        await Promise.all([
          getAdminToken(),
          getStoredAdmin<Admin>(),
        ]);

      if (storedToken && storedAdmin) {
        setToken(storedToken);
        setAdmin(storedAdmin);
      }
    } catch {
      await clearAdminAuth();

      setToken(null);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<void> => {
    const response = await adminLogin(
      email.trim(),
      password
    );

    await saveAdminAuth(
      response.token,
      response.admin
    );

    setToken(response.token);
    setAdmin(response.admin);
  };

  const logout = async (): Promise<void> => {
    await clearAdminAuth();

    setToken(null);
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        token,
        admin,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error(
      "useAdminAuth must be used inside AdminAuthProvider"
    );
  }

  return context;
}