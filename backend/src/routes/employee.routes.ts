import { Router } from "express";
import {
  employeeAuthMiddleware,
  AuthenticatedRequest,
} from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/profile",
  employeeAuthMiddleware,
  (req: AuthenticatedRequest, res) => {
    return res.status(200).json({
      success: true,
      message: "Protected employee endpoint accessed successfully",
      employee: {
        employeeId: req.employee!.employeeId,
        role: req.employee!.role,
      },
    });
  }
);

export default router;