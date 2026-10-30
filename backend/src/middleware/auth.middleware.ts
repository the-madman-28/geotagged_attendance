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
    role: string;
  };
}

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
      !("role" in decoded) ||
      typeof decoded.employeeId !== "string" ||
      decoded.role !== "EMPLOYEE"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid employee token",
      });
    }

    const employee = await prisma.employee.findUnique({
      where: {
        employeeId: decoded.employeeId,
      },
      select: {
        employeeId: true,
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
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error("JWT authentication error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}