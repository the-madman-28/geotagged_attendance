"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.punchIn = punchIn;
exports.punchOut = punchOut;
exports.editPunchIn = editPunchIn;
exports.editPunchOut = editPunchOut;
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
/**
 * Returns today's attendance date.
 *
 * The attendanceDate field is stored at midnight,
 * so all edit operations use the same calendar-day
 * comparison.
 */
function getTodayDate() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}
/**
 * Checks whether a Date belongs to today.
 */
function isSameCalendarDay(date, today) {
    return (date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate());
}
/**
 * Validates an edited timestamp.
 *
 * The employee may only select a time that belongs
 * to today's calendar day.
 */
function validateEditedTimestamp(value, fieldName) {
    if (!value) {
        return new Date();
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        throw new Error(`Invalid ${fieldName} time`);
    }
    const today = new Date();
    if (!isSameCalendarDay(parsed, today)) {
        throw new Error("Attendance can only be edited on the same day");
    }
    return parsed;
}
/**
 * EDIT PUNCH IN
 *
 * Only today's attendance can be edited.
 *
 * GPS is captured again and workplace distance
 * is recalculated.
 */
async function editPunchIn(data) {
    const { employeeId, latitude, longitude, accuracy, reason, punchIn, } = data;
    // 1. Check employee
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
    // 2. Get today's attendance
    const attendanceDate = getTodayDate();
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
    // 3. Automatically closed attendance cannot be edited
    if (attendance.autoPunchedOut) {
        throw new Error("Attendance cannot be edited after automatic punch out");
    }
    // 4. Validate edited timestamp
    const updatedPunchIn = validateEditedTimestamp(punchIn, "punch in");
    // 5. Get active workplace
    const workplace = await prisma_1.default.workplace.findFirst({
        where: {
            isActive: true,
        },
    });
    if (!workplace) {
        throw new Error("No active workplace configured");
    }
    // 6. Recalculate GPS distance
    const distance = (0, geolocation_1.calculateDistance)(latitude, longitude, Number(workplace.latitude), Number(workplace.longitude));
    // 7. Determine new status
    const isInRange = distance <= Number(workplace.radiusMeters);
    const status = isInRange
        ? "IN_RANGE"
        : "OUT_OF_RANGE";
    // 8. Require reason if outside workplace
    if (!isInRange && !reason?.trim()) {
        throw new Error("Reason is required when editing punch in outside the workplace");
    }
    // 9. Update punch-in
    const updatedAttendance = await prisma_1.default.attendance.update({
        where: {
            id: attendance.id,
        },
        data: {
            punchIn: updatedPunchIn,
            punchInLatitude: latitude,
            punchInLongitude: longitude,
            punchInAccuracy: accuracy,
            punchInDistance: distance,
            punchInStatus: status,
            punchInReason: isInRange
                ? null
                : reason.trim(),
        },
    });
    return {
        attendance: updatedAttendance,
        distance,
        radiusMeters: Number(workplace.radiusMeters),
        status,
    };
}
/**
 * EDIT PUNCH OUT
 *
 * Only today's attendance can be edited.
 *
 * GPS is captured again and workplace distance
 * is recalculated.
 */
async function editPunchOut(data) {
    const { employeeId, latitude, longitude, accuracy, reason, punchOut, } = data;
    // 1. Check employee
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
    // 2. Get today's attendance
    const attendanceDate = getTodayDate();
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
    // 3. Punch out must already exist
    if (!attendance.punchOut) {
        throw new Error("Punch out has not been marked");
    }
    // 4. Automatically closed attendance cannot be edited
    if (attendance.autoPunchedOut) {
        throw new Error("Attendance was automatically punched out and cannot be edited");
    }
    // 5. Validate edited timestamp
    const updatedPunchOut = validateEditedTimestamp(punchOut, "punch out");
    // 6. Prevent punch-out from being before punch-in
    if (updatedPunchOut.getTime() <
        attendance.punchIn.getTime()) {
        throw new Error("Punch out time cannot be before punch in time");
    }
    // 7. Get active workplace
    const workplace = await prisma_1.default.workplace.findFirst({
        where: {
            isActive: true,
        },
    });
    if (!workplace) {
        throw new Error("No active workplace configured");
    }
    // 8. Recalculate GPS distance
    const distance = (0, geolocation_1.calculateDistance)(latitude, longitude, Number(workplace.latitude), Number(workplace.longitude));
    // 9. Determine new status
    const isInRange = distance <= Number(workplace.radiusMeters);
    const status = isInRange
        ? "IN_RANGE"
        : "OUT_OF_RANGE";
    // 10. Require reason if outside workplace
    if (!isInRange && !reason?.trim()) {
        throw new Error("Reason is required when editing punch out outside the workplace");
    }
    // 11. Update punch-out
    const updatedAttendance = await prisma_1.default.attendance.update({
        where: {
            id: attendance.id,
        },
        data: {
            punchOut: updatedPunchOut,
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
/*
 * ============================================================
 * ATTENDANCE HISTORY
 * ============================================================
 */
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
    const attendanceDate = getTodayDate();
    return prisma_1.default.attendance.findUnique({
        where: {
            employeeId_attendanceDate: {
                employeeId,
                attendanceDate,
            },
        },
    });
}
