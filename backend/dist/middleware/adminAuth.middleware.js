"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuthMiddleware = adminAuthMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../config/prisma"));
const JWT_SECRET = process.env.JWT_SECRET ?? "";
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
}
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
            !("role" in decoded) ||
            typeof decoded.adminId !== "string" ||
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
        req.admin = {
            adminId: admin.id,
            role: decoded.role,
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
