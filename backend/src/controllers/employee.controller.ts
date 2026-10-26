import { Request, Response } from "express";

import {
  AuthenticatedRequest,
} from "../middleware/auth.middleware";

import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployeeStatus,
} from "../services/employee.service";

import {
  AuthenticatedAdminRequest,
} from "../middleware/adminAuth.middleware";

export async function createEmployeeController(
  req: AuthenticatedAdminRequest,
  res: Response
) {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required",
      });
    }

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

    if (
      typeof employeeId !== "string" ||
      typeof name !== "string"
    ) {
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

    const employee = await createEmployee({
      employeeId,
      name,
    });

    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
      employee,
    });
  } catch (error) {
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

export async function getAllEmployeesController(
  req: AuthenticatedAdminRequest,
  res: Response
) {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required",
      });
    }

    const employees = await getAllEmployees();

    return res.status(200).json({
      success: true,
      employees,
    });
  } catch (error) {
    console.error("Get employees error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getEmployeeByIdController(
  req: AuthenticatedAdminRequest,
  res: Response
) {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required",
      });
    }

    const employeeId = req.params.employeeId;

    if (typeof employeeId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID",
      });
    }

    const employee = await getEmployeeById(employeeId);

    return res.status(200).json({
      success: true,
      employee,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Employee not found"
    ) {
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

export async function updateEmployeeStatusController(
  req: AuthenticatedAdminRequest,
  res: Response
) {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required",
      });
    }

    const employeeId = req.params.employeeId;

    if (typeof employeeId !== "string" || !employeeId.trim()) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }
    const { isActive } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean",
      });
    }

    const employee = await updateEmployeeStatus(
      employeeId,
      isActive
    );

    return res.status(200).json({
      success: true,
      message: isActive
        ? "Employee activated successfully"
        : "Employee deactivated successfully",
      employee,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Employee not found"
    ) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    console.error(
      "Update employee status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getEmployeeProfileController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const employeeId = req.employee?.employeeId;

    if (!employeeId) {
      return res.status(401).json({
        success: false,
        message: "Employee authentication required",
      });
    }

    const employee = await getEmployeeById(employeeId);

    return res.status(200).json({
      success: true,
      employee,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Employee not found"
    ) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    console.error(
      "Get employee profile error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}