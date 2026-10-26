import { Router } from "express";
import {
  adminAuthMiddleware,
  AuthenticatedAdminRequest,
} from "../middleware/adminAuth.middleware";

const router = Router();

router.get(
  "/test",
  adminAuthMiddleware,
  (req: AuthenticatedAdminRequest, res) => {
    return res.status(200).json({
      success: true,
      message: "Admin authentication successful",
      admin: req.admin,
    });
  }
);

export default router;