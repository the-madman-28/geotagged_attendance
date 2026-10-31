import { Router } from "express";
import { adminAuthMiddleware } from "../middleware/adminAuth.middleware";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/test",
  adminAuthMiddleware,
  (req: AuthenticatedRequest, res) => {
    return res.status(200).json({
      success: true,
      message: "Admin authentication successful",
      admin: req.admin,
    });
  }
);

export default router;