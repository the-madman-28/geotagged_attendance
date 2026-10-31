import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";

const JWT_SECRET: string = process.env.JWT_SECRET ?? "";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

export interface AuthenticatedRequest extends Request {
  employee?: {
    employeeId: string;
    organizationId: string;
    role: "EMPLOYEE";
  };

  admin?: {
    adminId: string;
    organizationId: string;
    role: "ADMIN";
  };
}

/**
 * Employee authentication middleware
 */
export async function employeeAuthMiddleware(
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
      !("employeeId" in decoded) ||
      !("organizationId" in decoded) ||
      !("role" in decoded) ||
      typeof decoded.employeeId !== "string" ||
      typeof decoded.organizationId !== "string" ||
      decoded.role !== "EMPLOYEE"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid employee token",
      });
    }

    const employee = await prisma.employee.findUnique({
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
  } catch (error) {
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
  } catch (error) {
    console.error("Admin JWT authentication error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}