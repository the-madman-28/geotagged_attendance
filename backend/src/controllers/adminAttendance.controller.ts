import { Response } from "express";

import { AuthenticatedRequest } from "../middleware/auth.middleware";

import {
  getTodayAttendance,
  getAttendanceByEmployee,
  getOutOfRangeAttendance,
} from "../services/adminAttendance.service";

export async function getTodayAttendanceController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required",
      });
    }

    const organizationId = req.admin.organizationId;

    const attendance = await getTodayAttendance(
      organizationId
    );

    return res.status(200).json({
      success: true,
      attendance,
    });
  } catch (error) {
    console.error(
      "Get today's attendance error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getAttendanceByEmployeeController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required",
      });
    }

    const organizationId = req.admin.organizationId;
    const employeeId = req.params.employeeId;

    if (
      typeof employeeId !== "string" ||
      !employeeId.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    const attendance = await getAttendanceByEmployee(
      organizationId,
      employeeId
    );

    return res.status(200).json({
      success: true,
      employeeId,
      attendance,
    });
  } catch (error) {
    console.error(
      "Get employee attendance error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getOutOfRangeAttendanceController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required",
      });
    }

    const organizationId = req.admin.organizationId;

    const attendance =
      await getOutOfRangeAttendance(
        organizationId
      );

    return res.status(200).json({
      success: true,
      attendance,
    });
  } catch (error) {
    console.error(
      "Get out-of-range attendance error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}