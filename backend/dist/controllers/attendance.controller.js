"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.punchInController = punchInController;
exports.punchOutController = punchOutController;
exports.getAttendanceHistoryController = getAttendanceHistoryController;
const attendance_service_1 = require("../services/attendance.service");
async function punchInController(req, res) {
    try {
        // Employee identity comes from the JWT
        const employeeId = req.employee?.employeeId;
        if (!employeeId) {
            return res.status(401).json({
                success: false,
                message: "Employee authentication required",
            });
        }
        const { latitude, longitude, accuracy, reason, } = req.body;
        // Validate required GPS data
        if (latitude === undefined ||
            longitude === undefined ||
            accuracy === undefined) {
            return res.status(400).json({
                success: false,
                message: "Latitude, longitude and accuracy are required",
            });
        }
        // Validate numeric values
        if (typeof latitude !== "number" ||
            typeof longitude !== "number" ||
            typeof accuracy !== "number") {
            return res.status(400).json({
                success: false,
                message: "Latitude, longitude and accuracy must be numbers",
            });
        }
        // Basic coordinate validation
        if (latitude < -90 || latitude > 90) {
            return res.status(400).json({
                success: false,
                message: "Invalid latitude",
            });
        }
        if (longitude < -180 || longitude > 180) {
            return res.status(400).json({
                success: false,
                message: "Invalid longitude",
            });
        }
        if (accuracy < 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid GPS accuracy",
            });
        }
        const result = await (0, attendance_service_1.punchIn)({
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
        // Employee identity comes from JWT
        const employeeId = req.employee?.employeeId;
        if (!employeeId) {
            return res.status(401).json({
                success: false,
                message: "Employee authentication required",
            });
        }
        const { latitude, longitude, accuracy, reason, } = req.body;
        // Validate required GPS data
        if (latitude === undefined ||
            longitude === undefined ||
            accuracy === undefined) {
            return res.status(400).json({
                success: false,
                message: "Latitude, longitude and accuracy are required",
            });
        }
        // Validate numeric values
        if (typeof latitude !== "number" ||
            typeof longitude !== "number" ||
            typeof accuracy !== "number") {
            return res.status(400).json({
                success: false,
                message: "Latitude, longitude and accuracy must be numbers",
            });
        }
        // Validate latitude
        if (latitude < -90 || latitude > 90) {
            return res.status(400).json({
                success: false,
                message: "Invalid latitude",
            });
        }
        // Validate longitude
        if (longitude < -180 || longitude > 180) {
            return res.status(400).json({
                success: false,
                message: "Invalid longitude",
            });
        }
        // Validate GPS accuracy
        if (accuracy < 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid GPS accuracy",
            });
        }
        const result = await (0, attendance_service_1.punchOut)({
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
async function getAttendanceHistoryController(req, res) {
    try {
        // Employee identity comes only from JWT
        const employeeId = req.employee?.employeeId;
        if (!employeeId) {
            return res.status(401).json({
                success: false,
                message: "Employee authentication required",
            });
        }
        const attendance = await (0, attendance_service_1.getAttendanceHistory)(employeeId);
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
