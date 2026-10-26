import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import employeeRoutes from "./routes/employee.routes";
import attendanceRoutes from "./routes/attendance.routes";
import adminEmployeeRoutes from "./routes/adminEmployee.routes";

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

export default app;