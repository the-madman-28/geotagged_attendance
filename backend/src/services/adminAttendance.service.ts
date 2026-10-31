import prisma from "../config/prisma";

export async function getTodayAttendance(
  organizationId: string
) {
  const attendanceDate = new Date();
  attendanceDate.setHours(0, 0, 0, 0);

  const attendance = await prisma.attendance.findMany({
    where: {
      organizationId,
      attendanceDate,
    },
    orderBy: {
      punchIn: "asc",
    },
    select: {
      id: true,
      employeeId: true,
      attendanceDate: true,

      punchIn: true,
      punchInLatitude: true,
      punchInLongitude: true,
      punchInAccuracy: true,
      punchInDistance: true,
      punchInStatus: true,
      punchInReason: true,

      punchOut: true,
      punchOutLatitude: true,
      punchOutLongitude: true,
      punchOutAccuracy: true,
      punchOutDistance: true,
      punchOutStatus: true,
      punchOutReason: true,

      autoPunchedOut: true,

      createdAt: true,

      employee: {
        select: {
          employeeId: true,
          name: true,
        },
      },

      workplace: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return attendance;
}

export async function getAttendanceByEmployee(
  organizationId: string,
  employeeId: string
) {
  const employee = await prisma.employee.findUnique({
    where: {
      organizationId_employeeId: {
        organizationId,
        employeeId,
      },
    },
    select: {
      id: true,
    },
  });

  if (!employee) {
    return [];
  }

  const attendance = await prisma.attendance.findMany({
    where: {
      organizationId,
      employeeId: employee.id,
    },
    orderBy: {
      attendanceDate: "desc",
    },
    select: {
      id: true,
      employeeId: true,
      attendanceDate: true,

      punchIn: true,
      punchInLatitude: true,
      punchInLongitude: true,
      punchInAccuracy: true,
      punchInDistance: true,
      punchInStatus: true,
      punchInReason: true,

      punchOut: true,
      punchOutLatitude: true,
      punchOutLongitude: true,
      punchOutAccuracy: true,
      punchOutDistance: true,
      punchOutStatus: true,
      punchOutReason: true,

      autoPunchedOut: true,

      createdAt: true,

      employee: {
        select: {
          employeeId: true,
          name: true,
        },
      },

      workplace: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return attendance;
}

export async function getOutOfRangeAttendance(
  organizationId: string
) {
  const attendance = await prisma.attendance.findMany({
    where: {
      organizationId,
      OR: [
        {
          punchInStatus: "OUT_OF_RANGE",
        },
        {
          punchOutStatus: "OUT_OF_RANGE",
        },
      ],
    },
    orderBy: {
      attendanceDate: "desc",
    },
    select: {
      id: true,
      employeeId: true,
      attendanceDate: true,

      punchIn: true,
      punchInDistance: true,
      punchInStatus: true,
      punchInReason: true,

      punchOut: true,
      punchOutDistance: true,
      punchOutStatus: true,
      punchOutReason: true,

      autoPunchedOut: true,

      employee: {
        select: {
          employeeId: true,
          name: true,
        },
      },

      workplace: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return attendance;
}