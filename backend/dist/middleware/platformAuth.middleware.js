"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.platformAuthMiddleware = platformAuthMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../config/prisma"));
const JWT_SECRET = process.env.JWT_SECRET ?? "";
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
}
async function platformAuthMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (!decoded.platformAdminId ||
            decoded.role !== "PLATFORM_ADMIN") {
            return res.status(401).json({
                success: false,
                message: "Invalid platform admin token",
            });
        }
        const platformAdmin = await prisma_1.default.platformAdmin.findUnique({
            where: {
                id: decoded.platformAdminId,
            },
            select: {
                id: true,
                isActive: true,
            },
        });
        if (!platformAdmin) {
            return res.status(401).json({
                success: false,
                message: "Platform admin not found",
            });
        }
        if (!platformAdmin.isActive) {
            return res.status(403).json({
                success: false,
                message: "Platform admin account is inactive",
            });
        }
        req.platformAdmin = {
            platformAdminId: platformAdmin.id,
            role: "PLATFORM_ADMIN",
        };
        next();
    }
    catch (error) {
        console.error("Platform authentication error:", error);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
}
