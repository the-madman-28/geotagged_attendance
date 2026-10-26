"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processAutomaticPunchOut = processAutomaticPunchOut;
const prisma_1 = __importDefault(require("../config/prisma"));
async function processAutomaticPunchOut() {
    const now = new Date();
    // Find all attendance records that are still open
    const openAttendances = await prisma_1.default.attendance.findMany({
        where: {
            punchOut: null,
            autoPunchedOut: false,
        },
        include: {
            workplace: true,
        },
    });
    let processedCount = 0;
    for (const attendance of openAttendances) {
        const maximumSessionHours = Number(attendance.workplace.maximumSessionHours);
        const automaticPunchOutTime = new Date(attendance.punchIn.getTime() +
            maximumSessionHours * 60 * 60 * 1000);
        // Session has reached its maximum duration
        if (now >= automaticPunchOutTime) {
            await prisma_1.default.attendance.update({
                where: {
                    id: attendance.id,
                },
                data: {
                    punchOut: automaticPunchOutTime,
                    autoPunchedOut: true,
                },
            });
            processedCount++;
        }
    }
    return processedCount;
}
