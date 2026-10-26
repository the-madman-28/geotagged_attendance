import { AttendanceRecord } from "../api/attendance";

export type AttendanceState =
  | "NOT_MARKED"
  | "PUNCHED_IN"
  | "COMPLETED"
  | "AUTO_PUNCHED_OUT";

export function getAttendanceState(
  attendance: AttendanceRecord | null
): AttendanceState {
  if (!attendance) {
    return "NOT_MARKED";
  }

  if (attendance.autoPunchedOut) {
    return "AUTO_PUNCHED_OUT";
  }

  if (!attendance.punchOut) {
    return "PUNCHED_IN";
  }

  return "COMPLETED";
}

export function getAttendanceStateLabel(
  state: AttendanceState
): string {
  switch (state) {
    case "NOT_MARKED":
      return "Not Marked";

    case "PUNCHED_IN":
      return "Currently Punched In";

    case "COMPLETED":
      return "Attendance Completed";

    case "AUTO_PUNCHED_OUT":
      return "Automatically Punched Out";
  }
}