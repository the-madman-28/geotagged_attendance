import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";

const JWT_SECRET: string = process.env.JWT_SECRET ?? "";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

export interface PlatformAuthenticatedRequest extends Request {
  platformAdmin?: {
    platformAdminId: string;
    role: "PLATFORM_ADMIN";
  };
}

export async function platformAuthMiddleware(
  req: PlatformAuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET) as {
      platformAdminId?: string;
      role?: string;
    };

    if (
      !decoded.platformAdminId ||
      decoded.role !== "PLATFORM_ADMIN"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid platform admin token",
      });
    }

    const platformAdmin =
      await prisma.platformAdmin.findUnique({
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
  } catch (error) {
    console.error("Platform authentication error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}