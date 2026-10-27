// mobile/src/api/employee.ts

import { apiRequest } from "./client";
import { Employee } from "../types/auth";

interface EmployeeProfileResponse {
  success: boolean;
  employee: Employee;
}

export async function getEmployeeProfile(
  token: string
): Promise<EmployeeProfileResponse> {
  return apiRequest<EmployeeProfileResponse>(
    "/api/employee/profile",
    {
      method: "GET",
      token,
    }
  );
}