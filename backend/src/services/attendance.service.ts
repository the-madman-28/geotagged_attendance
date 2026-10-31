import prisma from "../config/prisma";
import { calculateDistance } from "../utils/geolocation";

interface PunchInData {
  organizationId: string;
  employeeId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  reason?: string;
}

export async function punchIn(data: PunchInData) {
  const {
    organizationId,
    employeeId,
    latitude,
    longitude,
    accuracy,
    reason,
  } = data;

  // employeeId here is the human-facing employee ID.
  // Find the employee inside the authenticated organization.
  const employee = await prisma.employee.findUnique({
    where: {
      organizationId_employeeId: {
        organizationId,
        employeeId,
      },
    },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  if (!employee.isActive) {
    throw new Error("Employee account is inactive");
  }

  // Find active workplace belonging to this organization.
  const workplace = await prisma.workplace.findFirst({
    where: {
      organizationId,
      isActive: true,
    },
  });

  if (!workplace) {
    throw new Error("No active workplace configured");
  }

  const distance = calculateDistance(
    latitude,
    longitude,
    Number(workplace.latitude),
    Number(workplace.longitude)
  );

  const isInRange =
    distance <= Number(workplace.radiusMeters);

  const status = isInRange
    ? "IN_RANGE"
    : "OUT_OF_RANGE";

  if (!isInRange && !reason?.trim()) {
    throw new Error(
      "Reason is required when punching in outside the workplace"
    );
  }

  const attendanceDate = new Date();
  attendanceDate.setHours(0, 0, 0, 0);

  // Attendance is unique per organization + employee + date.
  const existingAttendance =
    await prisma.attendance.findUnique({
      where: {
        organizationId_employeeId_attendanceDate: {
          organizationId,
          employeeId: employee.id,
          attendanceDate,
        },
      },
    });

  if (existingAttendance) {
    throw new Error(
      "Attendance has already been marked for today"
    );
  }

  const attendance = await prisma.attendance.create({
    data: {
      organizationId,

      // Attendance FK uses the internal Employee UUID.
      employeeId: employee.id,

      workplaceId: workplace.id,
      attendanceDate,

      punchIn: new Date(),

      punchInLatitude: latitude,
      punchInLongitude: longitude,
      punchInAccuracy: accuracy,
      punchInDistance: distance,
      punchInStatus: status,
      punchInReason: isInRange
        ? null
        : reason!.trim(),

      autoPunchedOut: false,
    },
  });

  return {
    attendance,
    distance,
    radiusMeters: Number(workplace.radiusMeters),
    status,
  };
}

interface PunchOutData {
  organizationId: string;
  employeeId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  reason?: string;
}

export async function punchOut(data: PunchOutData) {
  const {
    organizationId,
    employeeId,
    latitude,
    longitude,
    accuracy,
    reason,
  } = data;

  const employee = await prisma.employee.findUnique({
    where: {
      organizationId_employeeId: {
        organizationId,
        employeeId,
      },
    },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  if (!employee.isActive) {
    throw new Error("Employee account is inactive");
  }

  const attendanceDate = new Date();
  attendanceDate.setHours(0, 0, 0, 0);

  const attendance = await prisma.attendance.findUnique({
    where: {
      organizationId_employeeId_attendanceDate: {
        organizationId,
        employeeId: employee.id,
        attendanceDate,
      },
    },
  });

  if (!attendance) {
    throw new Error(
      "Attendance has not been marked for today"
    );
  }

  if (attendance.punchOut) {
    throw new Error(
      "Attendance has already been punched out"
    );
  }

  // Use the workplace associated with today's attendance.
  const workplace = await prisma.workplace.findFirst({
    where: {
      id: attendance.workplaceId,
      organizationId,
      isActive: true,
    },
  });

  if (!workplace) {
    throw new Error("No active workplace configured");
  }

  const distance = calculateDistance(
    latitude,
    longitude,
    Number(workplace.latitude),
    Number(workplace.longitude)
  );

  const isInRange =
    distance <= Number(workplace.radiusMeters);

  const status = isInRange
    ? "IN_RANGE"
    : "OUT_OF_RANGE";

  if (!isInRange && !reason?.trim()) {
    throw new Error(
      "Reason is required when punching out outside the workplace"
    );
  }

  const updatedAttendance =
    await prisma.attendance.update({
      where: {
        id: attendance.id,
      },
      data: {
        punchOut: new Date(),

        punchOutLatitude: latitude,
        punchOutLongitude: longitude,
        punchOutAccuracy: accuracy,
        punchOutDistance: distance,
        punchOutStatus: status,
        punchOutReason: isInRange
          ? null
          : reason!.trim(),

        autoPunchedOut: false,
      },
    });

  return {
    attendance: updatedAttendance,
    distance,
    radiusMeters: Number(workplace.radiusMeters),
    status,
  };
}

export async function getAttendanceHistory(
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
    throw new Error("Employee not found");
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
      workplaceId: true,
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

export async function getTodayAttendance(
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
    throw new Error("Employee not found");
  }

  const attendanceDate = new Date();
  attendanceDate.setHours(0, 0, 0, 0);

  return prisma.attendance.findUnique({
    where: {
      organizationId_employeeId_attendanceDate: {
        organizationId,
        employeeId: employee.id,
        attendanceDate,
      },
    },
  });
}