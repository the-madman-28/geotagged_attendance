import { Router } from "express";

import {
  employeeLoginController,
  adminLoginController,
  adminSignupController,
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

router.post(
  "/admin/signup",
  adminSignupController
);

export default router;