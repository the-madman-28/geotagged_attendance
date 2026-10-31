"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminDashboardSummaryController = getAdminDashboardSummaryController;
const adminDashboard_service_1 = require("../services/adminDashboard.service");
async function getAdminDashboardSummaryController(req, res) {
    try {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: "Admin authentication required",
            });
        }
        const organizationId = req.admin.organizationId;
        const summary = await (0, adminDashboard_service_1.getAdminDashboardSummary)(organizationId);
        return res.status(200).json({
            success: true,
            summary,
        });
    }
    catch (error) {
        console.error("Get admin dashboard summary error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
