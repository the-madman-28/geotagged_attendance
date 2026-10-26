import prisma from "../config/prisma";

export async function getAdminDashboardSummary() {
  const attendanceDate = new Date();
  attendanceDate.setHours(0, 0, 0, 0);

  const [
    totalEmployees,
    activeEmployees,
    totalAttendanceToday,
    currentlyPunchedIn,
    outOfRangeToday,
    autoPunchedOutToday,
  ] = await Promise.all([
    prisma.employee.count(),

    prisma.employee.count({
      where: {
        isActive: true,
      },
    }),

    prisma.attendance.count({
      where: {
        attendanceDate,
      },
    }),

    prisma.attendance.count({
      where: {
        attendanceDate,
        punchOut: null,
      },
    }),

    prisma.attendance.count({
      where: {
        attendanceDate,
        OR: [
          {
            punchInStatus: "OUT_OF_RANGE",
          },
          {
            punchOutStatus: "OUT_OF_RANGE",
          },
        ],
      },
    }),

    prisma.attendance.count({
      where: {
        attendanceDate,
        autoPunchedOut: true,
      },
    }),
  ]);

  return {
    totalEmployees,
    activeEmployees,
    totalAttendanceToday,
    currentlyPunchedIn,
    outOfRangeToday,
    autoPunchedOutToday,
  };
}