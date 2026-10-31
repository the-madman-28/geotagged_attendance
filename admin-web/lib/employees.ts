import { apiRequest } from "./api";
import { getAdminToken } from "./auth";

import {
  Employee,
  EmployeesResponse,
  EmployeeResponse,
  CreateEmployeeResponse,
  UpdateEmployeeStatusResponse,
  ResetDeviceResponse,
} from "@/types/employee";

function getToken() {
  const token = getAdminToken();

  if (!token) {
    throw new Error("Admin authentication required");
  }

  return token;
}

export async function getEmployees(): Promise<Employee[]> {
  const response =
    await apiRequest<EmployeesResponse>(
      "/api/admin/employees",
      {
        token: getToken(),
      }
    );

  return response.employees;
}

export async function getEmployee(
  employeeId: string
): Promise<Employee> {
  const response =
    await apiRequest<EmployeeResponse>(
      `/api/admin/employees/${encodeURIComponent(employeeId)}`,
      {
        token: getToken(),
      }
    );

  return response.employee;
}

export async function createEmployee(
  employeeId: string,
  name: string
): Promise<Employee> {
  const response =
    await apiRequest<CreateEmployeeResponse>(
      "/api/admin/employees",
      {
        method: "POST",
        token: getToken(),
        body: {
          employeeId,
          name,
        },
      }
    );

  return response.employee;
}

export async function updateEmployeeStatus(
  employeeId: string,
  isActive: boolean
): Promise<Employee> {
  const response =
    await apiRequest<UpdateEmployeeStatusResponse>(
      `/api/admin/employees/${encodeURIComponent(
        employeeId
      )}/status`,
      {
        method: "PATCH",
        token: getToken(),
        body: {
          isActive,
        },
      }
    );

  return response.employee;
}

export async function resetEmployeeDeviceRegistration(
  employeeId: string
): Promise<ResetDeviceResponse> {
  return apiRequest<ResetDeviceResponse>(
    `/api/admin/employees/${encodeURIComponent(
      employeeId
    )}/device-registration`,
    {
      method: "DELETE",
      token: getToken(),
    }
  );
}