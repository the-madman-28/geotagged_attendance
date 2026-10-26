import { Router } from "express";

import {
  employeeLoginController,
  adminLoginController,
} from "../controllers/auth.controller";

const router = Router();

router.post(
  "/employee/login",
  employeeLoginController
);

router.post(
  "/admin/login",
  adminLoginController
);

export default router;