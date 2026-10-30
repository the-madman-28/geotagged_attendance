import { apiRequest } from "./client";
import { EmployeeLoginResponse } from "../types/auth";

export async function employeeLogin(
  employeeId: string,
  deviceId: string
): Promise<EmployeeLoginResponse> {
  return apiRequest<EmployeeLoginResponse>(
    "/api/auth/employee/login",
    {
      method: "POST",
      body: {
        employeeId,
        deviceId,
      },
    }
  );
}