// mobile/src/api/client.ts

import { notifySessionExpired } from "../services/authSession.service";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("EXPO_PUBLIC_API_URL is not configured");
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const {
    method = "GET",
    body,
    token,
  } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      method,
      headers,
      body:
        body !== undefined
          ? JSON.stringify(body)
          : undefined,
    }
  );

  let data: any;

  try {
    data = await response.json();
  } catch {
    throw new ApiError(
      `Invalid server response (${response.status})`,
      response.status
    );
  }

  if (!response.ok) {
    if (response.status === 401 && token) {
      notifySessionExpired();
    }

    throw new ApiError(
      data?.message || "Request failed",
      response.status
    );
  }

  return data as T;
}