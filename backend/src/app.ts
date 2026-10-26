import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import employeeRoutes from "./routes/employee.routes";
import attendanceRoutes from "./routes/attendance.routes";
import adminEmployeeRoutes from "./routes/adminEmployee.routes";
import workplaceRoutes from "./routes/workplace.routes";
import adminAttendanceRoutes from "./routes/adminAttendance.routes";
import adminDashboardRoutes from "./routes/adminDashboard.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Geotagged Attendance API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);

app.use(
  "/api/admin/employees",
  adminEmployeeRoutes
);

app.use(
  "/api/admin/workplace",
  workplaceRoutes
);

app.use(
  "/api/admin/attendance",
  adminAttendanceRoutes
);

app.use(
  "/api/admin/dashboard",
  adminDashboardRoutes
);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Unhandled application error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
);



export default app;