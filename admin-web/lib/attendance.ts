import { apiRequest } from "./api";
import { getAdminToken } from "./auth";

import {
  AttendanceRecord,
  TodayAttendanceResponse,
  EmployeeAttendanceResponse,
  OutOfRangeAttendanceRecord,
  OutOfRangeAttendanceResponse,
} from "@/types/attendance";

function getToken() {
  const token = getAdminToken();

  if (!token) {
    throw new Error("Admin authentication required");
  }

  return token;
}

export async function getTodayAttendance(): Promise<
  AttendanceRecord[]
> {
  const response =
    await apiRequest<TodayAttendanceResponse>(
      "/api/admin/attendance/today",
      {
        token: getToken(),
      }
    );

  return response.attendance;
}

export async function getAttendanceByEmployee(
  employeeId: string
): Promise<AttendanceRecord[]> {
  const response =
    await apiRequest<EmployeeAttendanceResponse>(
      `/api/admin/attendance/employee/${encodeURIComponent(
        employeeId
      )}`,
      {
        token: getToken(),
      }
    );

  return response.attendance;
}

export async function getOutOfRangeAttendance(): Promise<
  OutOfRangeAttendanceRecord[]
> {
  const response =
    await apiRequest<OutOfRangeAttendanceResponse>(
      "/api/admin/attendance/out-of-range",
      {
        token: getToken(),
      }
    );

  return response.attendance;
}