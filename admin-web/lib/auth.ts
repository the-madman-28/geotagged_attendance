import { apiRequest } from "./api";
import { AdminLoginResponse } from "../types/auth";

const TOKEN_KEY = "admin_token";
const ADMIN_KEY = "admin_user";

export async function adminLogin(
  email: string,
  password: string
): Promise<AdminLoginResponse> {
  return apiRequest<AdminLoginResponse>(
    "/api/auth/admin/login",
    {
      method: "POST",
      body: {
        email,
        password,
      },
    }
  );
}

export function saveAdminAuth(
  token: string,
  admin: AdminLoginResponse["admin"]
) {
  if (typeof window === "undefined") return;

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
}

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;

  return localStorage.getItem(TOKEN_KEY);
}

export function getAdmin(): AdminLoginResponse["admin"] | null {
  if (typeof window === "undefined") return null;

  const data = localStorage.getItem(ADMIN_KEY);

  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function clearAdminAuth() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ADMIN_KEY);
}

export function isAdminLoggedIn(): boolean {
  return Boolean(getAdminToken());
}