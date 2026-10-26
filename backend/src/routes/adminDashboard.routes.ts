import { Router } from "express";

import { adminAuthMiddleware } from "../middleware/adminAuth.middleware";

import {
  getAdminDashboardSummaryController,
} from "../controllers/adminDashboard.controller";

const router = Router();

router.get(
  "/summary",
  adminAuthMiddleware,
  getAdminDashboardSummaryController
);

export default router;