export type AttendanceStatus =
  | "IN_RANGE"
  | "OUT_OF_RANGE";

export interface AttendanceEmployee {
  employeeId: string;
  name: string;
}

export interface AttendanceWorkplace {
  id: string;
  name: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  attendanceDate: string;

  punchIn: string | null;
  punchInLatitude: number | string | null;
  punchInLongitude: number | string | null;
  punchInAccuracy: number | string | null;
  punchInDistance: number | string | null;
  punchInStatus: AttendanceStatus | null;
  punchInReason: string | null;

  punchOut: string | null;
  punchOutLatitude: number | string | null;
  punchOutLongitude: number | string | null;
  punchOutAccuracy: number | string | null;
  punchOutDistance: number | string | null;
  punchOutStatus: AttendanceStatus | null;
  punchOutReason: string | null;

  autoPunchedOut: boolean;

  createdAt?: string;

  employee: AttendanceEmployee;
  workplace: AttendanceWorkplace;
}

export interface TodayAttendanceResponse {
  success: boolean;
  attendance: AttendanceRecord[];
}

export interface EmployeeAttendanceResponse {
  success: boolean;
  employeeId: string;
  attendance: AttendanceRecord[];
}

export interface OutOfRangeAttendanceRecord {
  id: string;
  employeeId: string;
  attendanceDate: string;

  punchIn: string | null;
  punchInDistance: number | string | null;
  punchInStatus: AttendanceStatus | null;
  punchInReason: string | null;

  punchOut: string | null;
  punchOutDistance: number | string | null;
  punchOutStatus: AttendanceStatus | null;
  punchOutReason: string | null;

  autoPunchedOut: boolean;

  employee: AttendanceEmployee;
  workplace: AttendanceWorkplace;
}

export interface OutOfRangeAttendanceResponse {
  success: boolean;
  attendance: OutOfRangeAttendanceRecord[];
}