import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import { AuthenticatedRequest } from "./auth.middleware";

const JWT_SECRET: string = process.env.JWT_SECRET ?? "";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

export async function adminAuthMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
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

    const decoded = jwt.verify(token, JWT_SECRET);

    if (
      typeof decoded !== "object" ||
      decoded === null ||
      !("adminId" in decoded) ||
      !("organizationId" in decoded) ||
      !("role" in decoded) ||
      typeof decoded.adminId !== "string" ||
      typeof decoded.organizationId !== "string" ||
      decoded.role !== "ADMIN"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin token",
      });
    }

    const admin = await prisma.admin.findUnique({
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

    // Ensure the admin still belongs to the organization
    // stored in the JWT.
    if (admin.organizationId !== decoded.organizationId) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin organization",
      });
    }

    req.admin = {
      adminId: admin.id,
      organizationId: admin.organizationId,
      role: "ADMIN",
    };

    next();
  } catch (error) {
    console.error("Admin JWT authentication error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}