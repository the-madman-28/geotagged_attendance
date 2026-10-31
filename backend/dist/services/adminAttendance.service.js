"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTodayAttendance = getTodayAttendance;
exports.getAttendanceByEmployee = getAttendanceByEmployee;
exports.getOutOfRangeAttendance = getOutOfRangeAttendance;
const prisma_1 = __importDefault(require("../config/prisma"));
async function getTodayAttendance(organizationId) {
    const attendanceDate = new Date();
    attendanceDate.setHours(0, 0, 0, 0);
    const attendance = await prisma_1.default.attendance.findMany({
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
async function getAttendanceByEmployee(organizationId, employeeId) {
    const employee = await prisma_1.default.employee.findUnique({
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
    const attendance = await prisma_1.default.attendance.findMany({
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
async function getOutOfRangeAttendance(organizationId) {
    const attendance = await prisma_1.default.attendance.findMany({
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
