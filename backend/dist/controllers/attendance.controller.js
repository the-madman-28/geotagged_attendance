"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.punchInController = punchInController;
exports.punchOutController = punchOutController;
exports.getAttendanceHistoryController = getAttendanceHistoryController;
exports.getTodayAttendanceController = getTodayAttendanceController;
const attendance_service_1 = require("../services/attendance.service");
function validateGpsData(latitude, longitude, accuracy) {
    if (latitude === undefined ||
        longitude === undefined ||
        accuracy === undefined) {
        return "Latitude, longitude and accuracy are required";
    }
    if (typeof latitude !== "number" ||
        typeof longitude !== "number" ||
        typeof accuracy !== "number") {
        return "Latitude, longitude and accuracy must be numbers";
    }
    if (latitude < -90 || latitude > 90) {
        return "Invalid latitude";
    }
    if (longitude < -180 || longitude > 180) {
        return "Invalid longitude";
    }
    if (accuracy < 0) {
        return "Invalid GPS accuracy";
    }
    return null;
}
async function punchInController(req, res) {
    try {
        const employeeId = req.employee?.employeeId;
        const organizationId = req.employee?.organizationId;
        if (!employeeId || !organizationId) {
            return res.status(401).json({
                success: false,
                message: "Employee authentication required",
            });
        }
        const { latitude, longitude, accuracy, reason, } = req.body;
        const gpsError = validateGpsData(latitude, longitude, accuracy);
        if (gpsError) {
            return res.status(400).json({
                success: false,
                message: gpsError,
            });
        }
        const result = await (0, attendance_service_1.punchIn)({
            organizationId,
            employeeId,
            latitude,
            longitude,
            accuracy,
            reason,
        });
        return res.status(201).json({
            success: true,
            message: result.status === "IN_RANGE"
                ? "Punch in successful"
                : "Punch in recorded for review",
            attendance: {
                id: result.attendance.id,
                employeeId: result.attendance.employeeId,
                workplaceId: result.attendance.workplaceId,
                punchIn: result.attendance.punchIn,
                punchInLatitude: result.attendance.punchInLatitude,
                punchInLongitude: result.attendance.punchInLongitude,
                punchInAccuracy: result.attendance.punchInAccuracy,
                punchInDistance: result.attendance.punchInDistance,
                punchInStatus: result.attendance.punchInStatus,
                punchInReason: result.attendance.punchInReason,
                autoPunchedOut: result.attendance.autoPunchedOut,
            },
        });
    }
    catch (error) {
        if (error instanceof Error) {
            switch (error.message) {
                case "Employee not found":
                    return res.status(401).json({
                        success: false,
                        message: "Employee not found",
                    });
                case "Employee account is inactive":
                    return res.status(403).json({
                        success: false,
                        message: "Employee account is inactive",
                    });
                case "No active workplace configured":
                    return res.status(503).json({
                        success: false,
                        message: "No active workplace configured",
                    });
                case "Reason is required when punching in outside the workplace":
                    return res.status(400).json({
                        success: false,
                        message: error.message,
                    });
                case "Attendance has already been marked for today":
                    return res.status(409).json({
                        success: false,
                        message: error.message,
                    });
            }
        }
        console.error("Punch in error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function punchOutController(req, res) {
    try {
        const employeeId = req.employee?.employeeId;
        const organizationId = req.employee?.organizationId;
        if (!employeeId || !organizationId) {
            return res.status(401).json({
                success: false,
                message: "Employee authentication required",
            });
        }
        const { latitude, longitude, accuracy, reason, } = req.body;
        const gpsError = validateGpsData(latitude, longitude, accuracy);
        if (gpsError) {
            return res.status(400).json({
                success: false,
                message: gpsError,
            });
        }
        const result = await (0, attendance_service_1.punchOut)({
            organizationId,
            employeeId,
            latitude,
            longitude,
            accuracy,
            reason,
        });
        return res.status(200).json({
            success: true,
            message: result.status === "IN_RANGE"
                ? "Punch out successful"
                : "Punch out recorded for review",
            attendance: {
                id: result.attendance.id,
                employeeId: result.attendance.employeeId,
                workplaceId: result.attendance.workplaceId,
                punchIn: result.attendance.punchIn,
                punchOut: result.attendance.punchOut,
                punchOutLatitude: result.attendance.punchOutLatitude,
                punchOutLongitude: result.attendance.punchOutLongitude,
                punchOutAccuracy: result.attendance.punchOutAccuracy,
                punchOutDistance: result.attendance.punchOutDistance,
                punchOutStatus: result.attendance.punchOutStatus,
                punchOutReason: result.attendance.punchOutReason,
                autoPunchedOut: result.attendance.autoPunchedOut,
            },
        });
    }
    catch (error) {
        if (error instanceof Error) {
            switch (error.message) {
                case "Employee not found":
                    return res.status(401).json({
                        success: false,
                        message: "Employee not found",
                    });
                case "Employee account is inactive":
                    return res.status(403).json({
                        success: false,
                        message: "Employee account is inactive",
                    });
                case "Attendance has not been marked for today":
                    return res.status(400).json({
                        success: false,
                        message: error.message,
                    });
                case "Attendance has already been punched out":
                    return res.status(409).json({
                        success: false,
                        message: error.message,
                    });
                case "No active workplace configured":
                    return res.status(503).json({
                        success: false,
                        message: "No active workplace configured",
                    });
                case "Reason is required when punching out outside the workplace":
                    return res.status(400).json({
                        success: false,
                        message: error.message,
                    });
            }
        }
        console.error("Punch out error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
/*
 * EDIT PUNCH IN
 *
 * Currently disabled.
 * The service layer performs the actual same-day
 * validation and GPS/workplace verification.
 */
// export async function editPunchInController(
//   req: AuthenticatedRequest,
//   res: Response
// ) {
//   ...
// }
/*
 * EDIT PUNCH OUT
 *
 * Currently disabled.
 * The service layer performs the actual same-day
 * validation and GPS/workplace verification.
 */
// export async function editPunchOutController(
//   req: AuthenticatedRequest,
//   res: Response
// ) {
//   ...
// }
async function getAttendanceHistoryController(req, res) {
    try {
        const employeeId = req.employee?.employeeId;
        const organizationId = req.employee?.organizationId;
        if (!employeeId || !organizationId) {
            return res.status(401).json({
                success: false,
                message: "Employee authentication required",
            });
        }
        const attendance = await (0, attendance_service_1.getAttendanceHistory)(organizationId, employeeId);
        return res.status(200).json({
            success: true,
            attendance,
        });
    }
    catch (error) {
        console.error("Get attendance history error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getTodayAttendanceController(req, res) {
    try {
        const employeeId = req.employee?.employeeId;
        const organizationId = req.employee?.organizationId;
        if (!employeeId || !organizationId) {
            return res.status(401).json({
                success: false,
                message: "Employee authentication required",
            });
        }
        const attendance = await (0, attendance_service_1.getTodayAttendance)(organizationId, employeeId);
        return res.status(200).json({
            success: true,
            attendance,
        });
    }
    catch (error) {
        console.error("Get today's attendance error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
