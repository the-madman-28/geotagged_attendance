import prisma from "../config/prisma";

export async function getTodayAttendance() {
  const attendanceDate = new Date();
  attendanceDate.setHours(0, 0, 0, 0);

  const attendance = await prisma.attendance.findMany({
    where: {
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
  employeeId: string
) {
  const attendance = await prisma.attendance.findMany({
    where: {
      employeeId,
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

export async function getOutOfRangeAttendance() {
  const attendance = await prisma.attendance.findMany({
    where: {
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