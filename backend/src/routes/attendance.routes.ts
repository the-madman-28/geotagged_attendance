import { Router } from "express";
import { employeeAuthMiddleware } from "../middleware/auth.middleware";

import {
  punchInController,
  punchOutController,
  getAttendanceHistoryController,
} from "../controllers/attendance.controller";

const router = Router();

router.post(
  "/punch-in",
  employeeAuthMiddleware,
  punchInController
);

router.post(
  "/punch-out",
  employeeAuthMiddleware,
  punchOutController
);

router.get(
  "/history",
  employeeAuthMiddleware,
  getAttendanceHistoryController
);

export default router;