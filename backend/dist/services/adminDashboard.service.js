"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminDashboardSummary = getAdminDashboardSummary;
const prisma_1 = __importDefault(require("../config/prisma"));
async function getAdminDashboardSummary() {
    const attendanceDate = new Date();
    attendanceDate.setHours(0, 0, 0, 0);
    const [totalEmployees, activeEmployees, totalAttendanceToday, currentlyPunchedIn, outOfRangeToday, autoPunchedOutToday,] = await Promise.all([
        prisma_1.default.employee.count(),
        prisma_1.default.employee.count({
            where: {
                isActive: true,
            },
        }),
        prisma_1.default.attendance.count({
            where: {
                attendanceDate,
            },
        }),
        prisma_1.default.attendance.count({
            where: {
                attendanceDate,
                punchOut: null,
            },
        }),
        prisma_1.default.attendance.count({
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
        prisma_1.default.attendance.count({
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
