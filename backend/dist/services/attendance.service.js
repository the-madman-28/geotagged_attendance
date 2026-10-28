"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.punchIn = punchIn;
exports.punchOut = punchOut;
exports.getAttendanceHistory = getAttendanceHistory;
exports.getTodayAttendance = getTodayAttendance;
const prisma_1 = __importDefault(require("../config/prisma"));
const geolocation_1 = require("../utils/geolocation");
async function punchIn(data) {
    const { employeeId, latitude, longitude, accuracy, reason, } = data;
    const employee = await prisma_1.default.employee.findUnique({
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
    const workplace = await prisma_1.default.workplace.findFirst({
        where: {
            isActive: true,
        },
    });
    if (!workplace) {
        throw new Error("No active workplace configured");
    }
    const distance = (0, geolocation_1.calculateDistance)(latitude, longitude, Number(workplace.latitude), Number(workplace.longitude));
    const isInRange = distance <= Number(workplace.radiusMeters);
    const status = isInRange
        ? "IN_RANGE"
        : "OUT_OF_RANGE";
    if (!isInRange && !reason?.trim()) {
        throw new Error("Reason is required when punching in outside the workplace");
    }
    const attendanceDate = new Date();
    attendanceDate.setHours(0, 0, 0, 0);
    const existingAttendance = await prisma_1.default.attendance.findUnique({
        where: {
            employeeId_attendanceDate: {
                employeeId,
                attendanceDate,
            },
        },
    });
    if (existingAttendance) {
        throw new Error("Attendance has already been marked for today");
    }
    const attendance = await prisma_1.default.attendance.create({
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
                : reason.trim(),
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
async function punchOut(data) {
    const { employeeId, latitude, longitude, accuracy, reason, } = data;
    const employee = await prisma_1.default.employee.findUnique({
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
    const attendanceDate = new Date();
    attendanceDate.setHours(0, 0, 0, 0);
    const attendance = await prisma_1.default.attendance.findUnique({
        where: {
            employeeId_attendanceDate: {
                employeeId,
                attendanceDate,
            },
        },
    });
    if (!attendance) {
        throw new Error("Attendance has not been marked for today");
    }
    if (attendance.punchOut) {
        throw new Error("Attendance has already been punched out");
    }
    const workplace = await prisma_1.default.workplace.findFirst({
        where: {
            isActive: true,
        },
    });
    if (!workplace) {
        throw new Error("No active workplace configured");
    }
    const distance = (0, geolocation_1.calculateDistance)(latitude, longitude, Number(workplace.latitude), Number(workplace.longitude));
    const isInRange = distance <= Number(workplace.radiusMeters);
    const status = isInRange
        ? "IN_RANGE"
        : "OUT_OF_RANGE";
    if (!isInRange && !reason?.trim()) {
        throw new Error("Reason is required when punching out outside the workplace");
    }
    const updatedAttendance = await prisma_1.default.attendance.update({
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
                : reason.trim(),
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
async function getAttendanceHistory(employeeId) {
    const attendance = await prisma_1.default.attendance.findMany({
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
async function getTodayAttendance(employeeId) {
    const attendanceDate = new Date();
    attendanceDate.setHours(0, 0, 0, 0);
    return prisma_1.default.attendance.findUnique({
        where: {
            employeeId_attendanceDate: {
                employeeId,
                attendanceDate,
            },
        },
    });
}
