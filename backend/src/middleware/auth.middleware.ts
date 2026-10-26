import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

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

export function employeeAuthMiddleware(
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

    req.employee = {
      employeeId: decoded.employeeId,
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