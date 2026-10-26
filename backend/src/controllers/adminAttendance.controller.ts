import { Response } from "express";

import { AuthenticatedAdminRequest } from "../middleware/adminAuth.middleware";

import {
  getTodayAttendance,
  getAttendanceByEmployee,
  getOutOfRangeAttendance,
} from "../services/adminAttendance.service";

export async function getTodayAttendanceController(
  req: AuthenticatedAdminRequest,
  res: Response
) {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required",
      });
    }

    const attendance = await getTodayAttendance();

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
  req: AuthenticatedAdminRequest,
  res: Response
) {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required",
      });
    }

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
  req: AuthenticatedAdminRequest,
  res: Response
) {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required",
      });
    }

    const attendance =
      await getOutOfRangeAttendance();

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