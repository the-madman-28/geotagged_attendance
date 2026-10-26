"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const employee_routes_1 = __importDefault(require("./routes/employee.routes"));
const attendance_routes_1 = __importDefault(require("./routes/attendance.routes"));
const adminEmployee_routes_1 = __importDefault(require("./routes/adminEmployee.routes"));
const workplace_routes_1 = __importDefault(require("./routes/workplace.routes"));
const adminAttendance_routes_1 = __importDefault(require("./routes/adminAttendance.routes"));
const adminDashboard_routes_1 = __importDefault(require("./routes/adminDashboard.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/api/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "Geotagged Attendance API is running",
    });
});
app.use("/api/auth", auth_routes_1.default);
app.use("/api/employee", employee_routes_1.default);
app.use("/api/attendance", attendance_routes_1.default);
app.use("/api/admin/employees", adminEmployee_routes_1.default);
app.use("/api/admin/workplace", workplace_routes_1.default);
app.use("/api/admin/attendance", adminAttendance_routes_1.default);
app.use("/api/admin/dashboard", adminDashboard_routes_1.default);
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});
app.use((error, _req, res, _next) => {
    console.error("Unhandled application error:", error);
    res.status(500).json({
        success: false,
        message: "Internal server error",
    });
});
exports.default = app;
