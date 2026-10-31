import { Response } from "express";

import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { getAdminDashboardSummary } from "../services/adminDashboard.service";

export async function getAdminDashboardSummaryController(
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

    const summary = await getAdminDashboardSummary(organizationId);

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