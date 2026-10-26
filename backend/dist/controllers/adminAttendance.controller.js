"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTodayAttendanceController = getTodayAttendanceController;
exports.getAttendanceByEmployeeController = getAttendanceByEmployeeController;
exports.getOutOfRangeAttendanceController = getOutOfRangeAttendanceController;
const adminAttendance_service_1 = require("../services/adminAttendance.service");
async function getTodayAttendanceController(req, res) {
    try {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: "Admin authentication required",
            });
        }
        const attendance = await (0, adminAttendance_service_1.getTodayAttendance)();
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
async function getAttendanceByEmployeeController(req, res) {
    try {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: "Admin authentication required",
            });
        }
        const employeeId = req.params.employeeId;
        if (typeof employeeId !== "string" ||
            !employeeId.trim()) {
            return res.status(400).json({
                success: false,
                message: "Employee ID is required",
            });
        }
        const attendance = await (0, adminAttendance_service_1.getAttendanceByEmployee)(employeeId);
        return res.status(200).json({
            success: true,
            employeeId,
            attendance,
        });
    }
    catch (error) {
        console.error("Get employee attendance error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getOutOfRangeAttendanceController(req, res) {
    try {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: "Admin authentication required",
            });
        }
        const attendance = await (0, adminAttendance_service_1.getOutOfRangeAttendance)();
        return res.status(200).json({
            success: true,
            attendance,
        });
    }
    catch (error) {
        console.error("Get out-of-range attendance error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
