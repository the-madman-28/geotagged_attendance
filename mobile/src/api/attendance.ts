import { apiRequest } from "./client";

export interface PunchInRequest {
  latitude: number;
  longitude: number;
  accuracy: number;
  reason?: string;
}

export interface PunchOutRequest {
  latitude: number;
  longitude: number;
  accuracy: number;
  reason?: string;
}

export interface AttendanceRecord {
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
  punchOutStatus?: "IN_RANGE" | "OUT_OF_RANGE" | null;
  punchOutReason?: string | null;

  autoPunchedOut: boolean;
  createdAt: string;
}

export interface PunchInResponse {
  success: boolean;
  message: string;
  attendance: AttendanceRecord;
}

export interface PunchOutResponse {
  success: boolean;
  message: string;
  attendance: AttendanceRecord;
}

export async function punchIn(
  token: string,
  data: PunchInRequest
): Promise<PunchInResponse> {
  return apiRequest<PunchInResponse>(
    "/api/attendance/punch-in",
    {
      method: "POST",
      token,
      body: data,
    }
  );
}

export async function punchOut(
  token: string,
  data: PunchOutRequest
): Promise<PunchOutResponse> {
  return apiRequest<PunchOutResponse>(
    "/api/attendance/punch-out",
    {
      method: "POST",
      token,
      body: data,
    }
  );
}

export interface AttendanceHistoryResponse {
  success: boolean;
  attendance: AttendanceRecord[];
}

export async function getAttendanceHistory(
  token: string
): Promise<AttendanceHistoryResponse> {
  return apiRequest<AttendanceHistoryResponse>(
    "/api/attendance/history",
    {
      method: "GET",
      token,
    }
  );
}

export interface TodayAttendanceResponse {
  success: boolean;
  attendance: AttendanceRecord | null;
}

export async function getTodayAttendance(
  token: string
): Promise<TodayAttendanceResponse> {
  return apiRequest<TodayAttendanceResponse>(
    "/api/attendance/today",
    {
      method: "GET",
      token,
    }
  );
}