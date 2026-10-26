import { Request, Response } from "express";
import { employeeLogin, adminLogin, } from "../services/auth.service";

export async function employeeLoginController(
  req: Request,
  res: Response
) {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    const result = await employeeLogin(employeeId);

    return res.status(200).json({
      success: true,
      message: "Employee login successful",
      ...result,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Employee not found") {
        return res.status(401).json({
          success: false,
          message: "Invalid employee ID",
        });
      }

      if (error.message === "Employee account is inactive") {
        return res.status(403).json({
          success: false,
          message: "Employee account is inactive",
        });
      }
    }

    console.error("Employee login error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function adminLoginController(
  req: Request,
  res: Response
) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const result = await adminLogin(email, password);

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      ...result,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Invalid admin credentials") {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      if (error.message === "Admin account is inactive") {
        return res.status(403).json({
          success: false,
          message: "Admin account is inactive",
        });
      }
    }

    console.error("Admin login error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}