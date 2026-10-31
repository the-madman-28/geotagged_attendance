"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmployeeController = createEmployeeController;
exports.getAllEmployeesController = getAllEmployeesController;
exports.getEmployeeByIdController = getEmployeeByIdController;
exports.updateEmployeeStatusController = updateEmployeeStatusController;
exports.getEmployeeProfileController = getEmployeeProfileController;
exports.resetEmployeeDeviceRegistrationController = resetEmployeeDeviceRegistrationController;
const employee_service_1 = require("../services/employee.service");
async function createEmployeeController(req, res) {
    try {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: "Admin authentication required",
            });
        }
        const organizationId = req.admin.organizationId;
        const { employeeId, name } = req.body;
        if (employeeId === undefined) {
            return res.status(400).json({
                success: false,
                message: "Employee ID is required",
            });
        }
        if (name === undefined) {
            return res.status(400).json({
                success: false,
                message: "Employee name is required",
            });
        }
        if (typeof employeeId !== "string" ||
            typeof name !== "string") {
            return res.status(400).json({
                success: false,
                message: "Employee ID and name must be strings",
            });
        }
        if (!employeeId.trim()) {
            return res.status(400).json({
                success: false,
                message: "Employee ID is required",
            });
        }
        if (!name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Employee name is required",
            });
        }
        const employee = await (0, employee_service_1.createEmployee)({
            organizationId,
            employeeId,
            name,
        });
        return res.status(201).json({
            success: true,
            message: "Employee created successfully",
            employee,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === "Employee ID already exists") {
                return res.status(409).json({
                    success: false,
                    message: error.message,
                });
            }
        }
        console.error("Create employee error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getAllEmployeesController(req, res) {
    try {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: "Admin authentication required",
            });
        }
        const organizationId = req.admin.organizationId;
        const employees = await (0, employee_service_1.getAllEmployees)(organizationId);
        return res.status(200).json({
            success: true,
            employees,
        });
    }
    catch (error) {
        console.error("Get employees error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getEmployeeByIdController(req, res) {
    try {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: "Admin authentication required",
            });
        }
        const organizationId = req.admin.organizationId;
        const employeeId = req.params.employeeId;
        if (typeof employeeId !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid employee ID",
            });
        }
        const employee = await (0, employee_service_1.getEmployeeById)(organizationId, employeeId);
        return res.status(200).json({
            success: true,
            employee,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "Employee not found") {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }
        console.error("Get employee by ID error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function updateEmployeeStatusController(req, res) {
    try {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: "Admin authentication required",
            });
        }
        const organizationId = req.admin.organizationId;
        const employeeId = req.params.employeeId;
        if (typeof employeeId !== "string" ||
            !employeeId.trim()) {
            return res.status(400).json({
                success: false,
                message: "Employee ID is required",
            });
        }
        const { isActive } = req.body;
        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isActive must be a boolean",
            });
        }
        const employee = await (0, employee_service_1.updateEmployeeStatus)(organizationId, employeeId, isActive);
        return res.status(200).json({
            success: true,
            message: isActive
                ? "Employee activated successfully"
                : "Employee deactivated successfully",
            employee,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "Employee not found") {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }
        console.error("Update employee status error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function getEmployeeProfileController(req, res) {
    try {
        const employeeId = req.employee?.employeeId;
        const organizationId = req.employee?.organizationId;
        if (!employeeId || !organizationId) {
            return res.status(401).json({
                success: false,
                message: "Employee authentication required",
            });
        }
        const employee = await (0, employee_service_1.getEmployeeById)(organizationId, employeeId);
        return res.status(200).json({
            success: true,
            employee,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "Employee not found") {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }
        console.error("Get employee profile error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
async function resetEmployeeDeviceRegistrationController(req, res) {
    try {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: "Admin authentication required",
            });
        }
        const organizationId = req.admin.organizationId;
        const employeeId = req.params.employeeId;
        if (typeof employeeId !== "string" || !employeeId.trim()) {
            return res.status(400).json({
                success: false,
                message: "Employee ID is required",
            });
        }
        const result = await (0, employee_service_1.resetEmployeeDeviceRegistration)(organizationId, employeeId);
        return res.status(200).json({
            success: true,
            message: result.deletedCount > 0
                ? "Device registration reset successfully"
                : "No device registration found for today",
            deletedCount: result.deletedCount,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "Employee not found") {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }
        console.error("Reset employee device registration error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
