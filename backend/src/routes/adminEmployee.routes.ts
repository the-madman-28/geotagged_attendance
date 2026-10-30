import { Router } from "express";

import { adminAuthMiddleware } from "../middleware/adminAuth.middleware";

import {
  createEmployeeController,
  getAllEmployeesController,
  getEmployeeByIdController,
  updateEmployeeStatusController,
  resetEmployeeDeviceRegistrationController,
} from "../controllers/employee.controller";

const router = Router();

router.post(
  "/",
  adminAuthMiddleware,
  createEmployeeController
);

router.get(
  "/",
  adminAuthMiddleware,
  getAllEmployeesController
);

router.get(
  "/:employeeId",
  adminAuthMiddleware,
  getEmployeeByIdController
);

router.patch(
  "/:employeeId/status",
  adminAuthMiddleware,
  updateEmployeeStatusController
);

router.delete(
  "/:employeeId/device-registration",
  adminAuthMiddleware,
  resetEmployeeDeviceRegistrationController
);

export default router;