"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeLoginController = employeeLoginController;
exports.adminLoginController = adminLoginController;
const auth_service_1 = require("../services/auth.service");
async function employeeLoginController(req, res) {
    try {
        const { organizationSlug, employeeId, deviceId, } = req.body;
        if (!organizationSlug) {
            return res.status(400).json({
                success: false,
                message: "Organization code is required",
            });
        }
        if (!employeeId) {
            return res.status(400).json({
                success: false,
                message: "Employee ID is required",
            });
        }
        if (!deviceId) {
            return res.status(400).json({
                success: false,
                message: "Device ID is required",
            });
        }
        const result = await (0, auth_service_1.employeeLogin)(organizationSlug, employeeId, deviceId);
        return res.status(200).json({
            success: true,
            message: "Employee login successful",
            ...result,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === "Organization not found") {
                return res.status(404).json({
                    success: false,
                    message: "Invalid organization code",
                });
            }
            if (error.message === "Organization is inactive") {
                return res.status(403).json({
                    success: false,
                    message: "Organization is inactive",
                });
            }
            if (error.message === "Employee not found") {
                return res.status(401).json({
                    success: false,
                    message: "Invalid employee ID",
                });
            }
            if (error.message === "Employee account is inactive") {
                return res.status(403).json({
                    success: false,
                    message: "Employee account is inactive",
                });
            }
            if (error.message ===
                "Device is already registered for another employee") {
                return res.status(409).json({
                    success: false,
                    message: "Device is already registered for another employee",
                });
            }
        }
        console.error("Employee login error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function adminLoginController(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }
        const result = await (0, auth_service_1.adminLogin)(email, password);
        return res.status(200).json({
            success: true,
            message: "Admin login successful",
            ...result,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === "Invalid admin credentials") {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password",
                });
            }
            if (error.message === "Admin account is inactive") {
                return res.status(403).json({
                    success: false,
                    message: "Admin account is inactive",
                });
            }
            if (error.message === "Organization is inactive") {
                return res.status(403).json({
                    success: false,
                    message: "Organization is inactive",
                });
            }
        }
        console.error("Admin login error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
