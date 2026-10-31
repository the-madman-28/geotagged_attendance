import { apiRequest } from "./api";
import { getAdminToken } from "./auth";

import {
  Workplace,
  WorkplaceResponse,
  CreateWorkplaceResponse,
  UpdateWorkplaceResponse,
} from "@/types/workplace";

function getToken() {
  const token = getAdminToken();

  if (!token) {
    throw new Error("Admin authentication required");
  }

  return token;
}

export async function getWorkplace(): Promise<Workplace> {
  const response = await apiRequest<WorkplaceResponse>(
    "/api/admin/workplace",
    {
      token: getToken(),
    }
  );

  return response.workplace;
}

export async function createWorkplace(data: {
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  maximumSessionHours: number;
}): Promise<Workplace> {
  const response =
    await apiRequest<CreateWorkplaceResponse>(
      "/api/admin/workplace",
      {
        method: "POST",
        token: getToken(),
        body: data,
      }
    );

  return response.workplace;
}

export async function updateWorkplace(data: {
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  maximumSessionHours: number;
}): Promise<Workplace> {
  const response =
    await apiRequest<UpdateWorkplaceResponse>(
      "/api/admin/workplace",
      {
        method: "PUT",
        token: getToken(),
        body: data,
      }
    );

  return response.workplace;
}