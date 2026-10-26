"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeAuthMiddleware = employeeAuthMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET ?? "";
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
}
function employeeAuthMiddleware(req, res, next) {
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
            !("role" in decoded) ||
            typeof decoded.employeeId !== "string" ||
            decoded.role !== "EMPLOYEE") {
            return res.status(401).json({
                success: false,
                message: "Invalid employee token",
            });
        }
        req.employee = {
            employeeId: decoded.employeeId,
            role: decoded.role,
        };
        next();
    }
    catch (error) {
        console.error("JWT authentication error:", error);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
}
