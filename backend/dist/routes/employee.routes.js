"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get("/profile", auth_middleware_1.employeeAuthMiddleware, (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Protected employee endpoint accessed successfully",
        employee: {
            employeeId: req.employee.employeeId,
            role: req.employee.role,
        },
    });
});
exports.default = router;
