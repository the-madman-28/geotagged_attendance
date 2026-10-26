import prisma from "../config/prisma";
import { calculateDistance } from "../utils/geolocation";

interface PunchInData {
  employeeId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  reason?: string;
}

export async function punchIn(data: PunchInData) {
  const {
    employeeId,
    latitude,
    longitude,
    accuracy,
    reason,
  } = data;

  // 1. Check employee
  const employee = await prisma.employee.findUnique({
    where: {
      employeeId,
    },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  if (!employee.isActive) {
    throw new Error("Employee account is inactive");
  }

  // 2. Get active workplace
  const workplace = await prisma.workplace.findFirst({
    where: {
      isActive: true,
    },
  });

  if (!workplace) {
    throw new Error("No active workplace configured");
  }

  // 3. Calculate distance
  const distance = calculateDistance(
    latitude,
    longitude,
    Number(workplace.latitude),
    Number(workplace.longitude)
  );

  // 4. Determine attendance status
  const isInRange =
    distance <= Number(workplace.radiusMeters);

  const status = isInRange
    ? "IN_RANGE"
    : "OUT_OF_RANGE";

  // 5. Out-of-range attendance requires a reason
  if (!isInRange && !reason?.trim()) {
    throw new Error(
      "Reason is required when punching in outside the workplace"
    );
  }

  // 6. Get today's date
  const attendanceDate = new Date();

  attendanceDate.setHours(0, 0, 0, 0);

  // 7. Check whether employee already punched in today
  const existingAttendance =
    await prisma.attendance.findUnique({
      where: {
        employeeId_attendanceDate: {
          employeeId,
          attendanceDate,
        },
      },
    });

  if (existingAttendance) {
    throw new Error(
      "Attendance has already been marked for today"
    );
  }

  // 8. Create attendance record
  const attendance = await prisma.attendance.create({
    data: {
      employeeId,
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
  employeeId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  reason?: string;
}

export async function punchOut(data: PunchOutData) {
  const {
    employeeId,
    latitude,
    longitude,
    accuracy,
    reason,
  } = data;

  // 1. Check employee
  const employee = await prisma.employee.findUnique({
    where: {
      employeeId,
    },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  if (!employee.isActive) {
    throw new Error("Employee account is inactive");
  }

  // 2. Get today's attendance
  const attendanceDate = new Date();

  attendanceDate.setHours(0, 0, 0, 0);

  const attendance = await prisma.attendance.findUnique({
    where: {
      employeeId_attendanceDate: {
        employeeId,
        attendanceDate,
      },
    },
  });

  // 3. Employee must have punched in first
  if (!attendance) {
    throw new Error(
      "Attendance has not been marked for today"
    );
  }

  // 4. Employee cannot punch out twice
  if (attendance.punchOut) {
    throw new Error(
      "Attendance has already been punched out"
    );
  }

  // 5. Get active workplace
  const workplace = await prisma.workplace.findFirst({
    where: {
      isActive: true,
    },
  });

  if (!workplace) {
    throw new Error("No active workplace configured");
  }

  // 6. Calculate distance from workplace
  const distance = calculateDistance(
    latitude,
    longitude,
    Number(workplace.latitude),
    Number(workplace.longitude)
  );

  // 7. Determine punch-out status
  const isInRange =
    distance <= Number(workplace.radiusMeters);

  const status = isInRange
    ? "IN_RANGE"
    : "OUT_OF_RANGE";

  // 8. Out-of-range punch-out requires a reason
  if (!isInRange && !reason?.trim()) {
    throw new Error(
      "Reason is required when punching out outside the workplace"
    );
  }

  // 9. Update attendance
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