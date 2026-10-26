"use strict";
// import { Router } from "express";
// import {
//   employeeAuthMiddleware,
//   AuthenticatedRequest,
//   getEmployeeProfileController,
// } from "../middleware/auth.middleware";
Object.defineProperty(exports, "__esModule", { value: true });
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
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const employee_controller_1 = require("../controllers/employee.controller");
const router = (0, express_1.Router)();
router.get("/profile", auth_middleware_1.employeeAuthMiddleware, employee_controller_1.getEmployeeProfileController);
exports.default = router;
