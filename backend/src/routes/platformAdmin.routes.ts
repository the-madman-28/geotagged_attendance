import { Router } from "express";

import {
  platformAdminLoginController,
  createOrganizationAdminController,
  getOrganizationsController,
} from "../controllers/platformAdmin.controller";

import { platformAuthMiddleware } from "../middleware/platformAuth.middleware";

const router = Router();

router.post("/login", platformAdminLoginController);

router.get(
  "/organizations",
  platformAuthMiddleware,
  getOrganizationsController
);

router.post(
  "/admins",
  platformAuthMiddleware,
  createOrganizationAdminController
);

export default router;