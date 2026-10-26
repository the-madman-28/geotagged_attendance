"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminAuth_middleware_1 = require("../middleware/adminAuth.middleware");
const adminDashboard_controller_1 = require("../controllers/adminDashboard.controller");
const router = (0, express_1.Router)();
router.get("/summary", adminAuth_middleware_1.adminAuthMiddleware, adminDashboard_controller_1.getAdminDashboardSummaryController);
exports.default = router;
