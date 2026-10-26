// import { Router } from "express";
// import {
//   employeeAuthMiddleware,
//   AuthenticatedRequest,
//   getEmployeeProfileController,
// } from "../middleware/auth.middleware";

// const router = Router();

// router.get(
//   "/profile",
//   employeeAuthMiddleware,
//   (req: AuthenticatedRequest, res) => {
//     return res.status(200).json({
//       success: true,
//       message: "Protected employee endpoint accessed successfully",
//       employee: {
//         employeeId: req.employee!.employeeId,
//         role: req.employee!.role,
//       },
//     });
//   }
// );

// router.get(
//   "/profile",
//   employeeAuthMiddleware,
//   getEmployeeProfileController,
// );

// export default router;

import { Router } from "express";

import { employeeAuthMiddleware } from "../middleware/auth.middleware";

import {
  getEmployeeProfileController,
} from "../controllers/employee.controller";

const router = Router();

router.get(
  "/profile",
  employeeAuthMiddleware,
  getEmployeeProfileController
);

export default router;