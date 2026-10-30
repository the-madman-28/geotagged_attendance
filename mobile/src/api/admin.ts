import { apiRequest } from "./client";

/* =========================
   ADMIN AUTH
========================= */

export interface Admin {
  id: string;
  email: string;
}

export interface AdminLoginResponse {
  success: boolean;
  message: string;
  token: string;
  admin: Admin;
}

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

/* =========================
   DASHBOARD
========================= */

export interface AdminDashboardSummary {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  presentToday: number;
  punchedInToday: number;
  completedToday: number;
  outOfRangeToday: number;
}

export interface AdminDashboardResponse {
  success: boolean;
  summary: AdminDashboardSummary;
}

export async function getAdminDashboardSummary(
  token: string
): Promise<AdminDashboardResponse> {
  return apiRequest<AdminDashboardResponse>(
    "/api/admin/dashboard/summary",
    {
      method: "GET",
      token,
    }
  );
}

/* =========================
   EMPLOYEES
========================= */

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
    `/api/admin/employees/${encodeURIComponent(
      employeeId
    )}`,
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
    `/api/admin/employees/${encodeURIComponent(
      employeeId
    )}/status`,
    {
      method: "PATCH",
      body: {
        isActive,
      },
      token,
    }
  );
}

/* =========================
   WORKPLACE
========================= */

export interface AdminWorkplace {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  maximumSessionHours: number;
  isActive: boolean;
  createdAt: string;
}

export interface AdminWorkplaceResponse {
  success: boolean;
  workplace: AdminWorkplace;
}

export interface SaveWorkplaceRequest {
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  maximumSessionHours: number;
  isActive?: boolean;
}

export async function getWorkplace(
  token: string
): Promise<AdminWorkplaceResponse> {
  return apiRequest<AdminWorkplaceResponse>(
    "/api/admin/workplace",
    {
      method: "GET",
      token,
    }
  );
}

export async function createWorkplace(
  token: string,
  data: SaveWorkplaceRequest
): Promise<AdminWorkplaceResponse> {
  return apiRequest<AdminWorkplaceResponse>(
    "/api/admin/workplace",
    {
      method: "POST",
      body: data,
      token,
    }
  );
}

export async function updateWorkplace(
  token: string,
  data: SaveWorkplaceRequest
): Promise<AdminWorkplaceResponse> {
  return apiRequest<AdminWorkplaceResponse>(
    "/api/admin/workplace",
    {
      method: "PUT",
      body: data,
      token,
    }
  );
}

/* =========================
   ATTENDANCE
========================= */

export interface AdminAttendanceRecord {
  id: string;
  employeeId: string;
  workplaceId: string;
  attendanceDate: string;

  punchIn: string;
  punchInLatitude: number;
  punchInLongitude: number;
  punchInAccuracy: number;
  punchInDistance: number;
  punchInStatus: "IN_RANGE" | "OUT_OF_RANGE";
  punchInReason?: string | null;

  punchOut?: string | null;
  punchOutLatitude?: number | null;
  punchOutLongitude?: number | null;
  punchOutAccuracy?: number | null;
  punchOutDistance?: number | null;
  punchOutStatus?:
    | "IN_RANGE"
    | "OUT_OF_RANGE"
    | null;
  punchOutReason?: string | null;

  autoPunchedOut: boolean;
  createdAt: string;
}

export interface AdminAttendanceResponse {
  success: boolean;
  attendance: AdminAttendanceRecord[];
}

export async function getTodayAttendance(
  token: string
): Promise<AdminAttendanceResponse> {
  return apiRequest<AdminAttendanceResponse>(
    "/api/admin/attendance/today",
    {
      method: "GET",
      token,
    }
  );
}

export async function getEmployeeAttendance(
  token: string,
  employeeId: string
): Promise<AdminAttendanceResponse> {
  return apiRequest<AdminAttendanceResponse>(
    `/api/admin/attendance/employee/${encodeURIComponent(
      employeeId
    )}`,
    {
      method: "GET",
      token,
    }
  );
}

export async function getOutOfRangeAttendance(
  token: string
): Promise<AdminAttendanceResponse> {
  return apiRequest<AdminAttendanceResponse>(
    "/api/admin/attendance/out-of-range",
    {
      method: "GET",
      token,
    }
  );
}

export async function resetEmployeeDeviceRegistration(
  token: string,
  employeeId: string
) {
  return apiRequest<{
    success: boolean;
    message: string;
    deletedCount: number;
  }>(
    `/api/admin/employees/${encodeURIComponent(
      employeeId
    )}/device-registration`,
    {
      method: "DELETE",
      token,
    }
  );
}