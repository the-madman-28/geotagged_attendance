"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeAuthMiddleware = employeeAuthMiddleware;
exports.adminAuthMiddleware = adminAuthMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../config/prisma"));
const JWT_SECRET = process.env.JWT_SECRET ?? "";
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
}
/**
 * Employee authentication middleware
 */
async function employeeAuthMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authorization header is required",
            });
        }
        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Invalid authorization format",
            });
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "JWT token is required",
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (typeof decoded !== "object" ||
            decoded === null ||
            !("employeeId" in decoded) ||
            !("organizationId" in decoded) ||
            !("role" in decoded) ||
            typeof decoded.employeeId !== "string" ||
            typeof decoded.organizationId !== "string" ||
            decoded.role !== "EMPLOYEE") {
            return res.status(401).json({
                success: false,
                message: "Invalid employee token",
            });
        }
        const employee = await prisma_1.default.employee.findUnique({
            where: {
                organizationId_employeeId: {
                    organizationId: decoded.organizationId,
                    employeeId: decoded.employeeId,
                },
            },
            select: {
                id: true,
                employeeId: true,
                organizationId: true,
                isActive: true,
            },
        });
        if (!employee) {
            return res.status(401).json({
                success: false,
                message: "Employee account not found",
            });
        }
        if (!employee.isActive) {
            return res.status(403).json({
                success: false,
                message: "Employee account is inactive",
            });
        }
        req.employee = {
            employeeId: employee.employeeId,
            organizationId: employee.organizationId,
            role: "EMPLOYEE",
        };
        next();
    }
    catch (error) {
        console.error("Employee JWT authentication error:", error);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
}
/**
 * Admin authentication middleware
 */
async function adminAuthMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authorization header is required",
            });
        }
        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Invalid authorization format",
            });
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "JWT token is required",
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (typeof decoded !== "object" ||
            decoded === null ||
            !("adminId" in decoded) ||
            !("organizationId" in decoded) ||
            !("role" in decoded) ||
            typeof decoded.adminId !== "string" ||
            typeof decoded.organizationId !== "string" ||
            decoded.role !== "ADMIN") {
            return res.status(401).json({
                success: false,
                message: "Invalid admin token",
            });
        }
        const admin = await prisma_1.default.admin.findUnique({
            where: {
                id: decoded.adminId,
            },
            select: {
                id: true,
                organizationId: true,
                isActive: true,
            },
        });
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Admin account not found",
            });
        }
        if (!admin.isActive) {
            return res.status(403).json({
                success: false,
                message: "Admin account is inactive",
            });
        }
        // Important security check:
        // The organization in the JWT must match the admin's
        // actual organization in the database.
        if (admin.organizationId !== decoded.organizationId) {
            return res.status(401).json({
                success: false,
                message: "Invalid organization context",
            });
        }
        req.admin = {
            adminId: admin.id,
            organizationId: admin.organizationId,
            role: "ADMIN",
        };
        next();
    }
    catch (error) {
        console.error("Admin JWT authentication error:", error);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
}
