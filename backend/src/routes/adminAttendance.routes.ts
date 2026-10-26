import { Router } from "express";

import { adminAuthMiddleware } from "../middleware/adminAuth.middleware";

import {
  getTodayAttendanceController,
  getAttendanceByEmployeeController,
  getOutOfRangeAttendanceController,
} from "../controllers/adminAttendance.controller";

const router = Router();

router.get(
  "/today",
  adminAuthMiddleware,
  getTodayAttendanceController
);

router.get(
  "/employee/:employeeId",
  adminAuthMiddleware,
  getAttendanceByEmployeeController
);

router.get(
  "/out-of-range",
  adminAuthMiddleware,
  getOutOfRangeAttendanceController
);

export default router;