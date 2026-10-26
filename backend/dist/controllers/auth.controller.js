"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeLoginController = employeeLoginController;
exports.adminLoginController = adminLoginController;
const auth_service_1 = require("../services/auth.service");
async function employeeLoginController(req, res) {
    try {
        const { employeeId } = req.body;
        if (!employeeId) {
            return res.status(400).json({
                success: false,
                message: "Employee ID is required",
            });
        }
        const result = await (0, auth_service_1.employeeLogin)(employeeId);
        return res.status(200).json({
            success: true,
            message: "Employee login successful",
            ...result,
        });
    }
    catch (error) {
        if (error instanceof Error) {
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
        }
        console.error("Admin login error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
