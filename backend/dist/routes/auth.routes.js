"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
router.post("/employee/login", auth_controller_1.employeeLoginController);
router.post("/admin/login", auth_controller_1.adminLoginController);
router.post("/admin/signup", auth_controller_1.adminSignupController);
exports.default = router;
