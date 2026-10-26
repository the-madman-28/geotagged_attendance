import { Response } from "express";

import { AuthenticatedAdminRequest } from "../middleware/adminAuth.middleware";

import { getAdminDashboardSummary } from "../services/adminDashboard.service";

export async function getAdminDashboardSummaryController(
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

    const summary = await getAdminDashboardSummary();

    return res.status(200).json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error(
      "Get admin dashboard summary error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}