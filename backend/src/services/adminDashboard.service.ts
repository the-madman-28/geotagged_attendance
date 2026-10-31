import prisma from "../config/prisma";

export async function getAdminDashboardSummary(
  organizationId: string
) {
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
    prisma.employee.count({
      where: {
        organizationId,
      },
    }),

    prisma.employee.count({
      where: {
        organizationId,
        isActive: true,
      },
    }),

    prisma.attendance.count({
      where: {
        organizationId,
        attendanceDate,
      },
    }),

    prisma.attendance.count({
      where: {
        organizationId,
        attendanceDate,
        punchOut: null,
      },
    }),

    prisma.attendance.count({
      where: {
        organizationId,
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
        organizationId,
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