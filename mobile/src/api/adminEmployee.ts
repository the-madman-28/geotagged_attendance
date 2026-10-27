import { apiRequest } from "./client";

export interface AdminEmployee {
  employeeId: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminEmployeesResponse {
  success: boolean;
  employees: AdminEmployee[];
}

export interface AdminEmployeeResponse {
  success: boolean;
  employee: AdminEmployee;
}

export interface CreateEmployeeRequest {
  employeeId: string;
  name: string;
}

export interface UpdateEmployeeStatusRequest {
  isActive: boolean;
}

export async function createEmployee(
  token: string,
  data: CreateEmployeeRequest
): Promise<AdminEmployeeResponse> {
  return apiRequest<AdminEmployeeResponse>(
    "/api/admin/employees",
    {
      method: "POST",
      body: data,
      token,
    }
  );
}

export async function getEmployees(
  token: string
): Promise<AdminEmployeesResponse> {
  return apiRequest<AdminEmployeesResponse>(
    "/api/admin/employees",
    {
      method: "GET",
      token,
    }
  );
}

export async function getEmployee(
  token: string,
  employeeId: string
): Promise<AdminEmployeeResponse> {
  return apiRequest<AdminEmployeeResponse>(
    `/api/admin/employees/${encodeURIComponent(employeeId)}`,
    {
      method: "GET",
      token,
    }
  );
}

export async function updateEmployeeStatus(
  token: string,
  employeeId: string,
  isActive: boolean
): Promise<AdminEmployeeResponse> {
  return apiRequest<AdminEmployeeResponse>(
    `/api/admin/employees/${encodeURIComponent(employeeId)}/status`,
    {
      method: "PATCH",
      body: {
        isActive,
      },
      token,
    }
  );
}