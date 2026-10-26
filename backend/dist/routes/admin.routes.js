"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminAuth_middleware_1 = require("../middleware/adminAuth.middleware");
const router = (0, express_1.Router)();
router.get("/test", adminAuth_middleware_1.adminAuthMiddleware, (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Admin authentication successful",
        admin: req.admin,
    });
});
exports.default = router;
