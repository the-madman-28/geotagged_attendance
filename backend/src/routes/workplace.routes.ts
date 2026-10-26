import { Router } from "express";

import { adminAuthMiddleware } from "../middleware/adminAuth.middleware";

import {
  createWorkplaceController,
  getWorkplaceController,
  updateWorkplaceController,
} from "../controllers/workplace.controller";

const router = Router();

router.post(
  "/",
  adminAuthMiddleware,
  createWorkplaceController
);

router.get(
  "/",
  adminAuthMiddleware,
  getWorkplaceController
);

router.put(
  "/",
  adminAuthMiddleware,
  updateWorkplaceController
);

export default router;