import { Request, Response } from "express";
import {
  createOrganizationAdmin,
  getOrganizationsForPlatformAdmin,
  platformAdminLogin,
} from "../services/platformAdmin.service";

export async function platformAdminLoginController(
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

    const result = await platformAdminLogin(
      email.trim().toLowerCase(),
      password
    );

    return res.status(200).json({
      success: true,
      message: "Platform admin login successful",
      ...result,
    });
  } catch (error) {
    console.error("Platform admin login error:", error);

    return res.status(401).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Invalid credentials",
    });
  }
}

export async function createOrganizationAdminController(
  req: Request,
  res: Response
) {
  try {
    const { organizationId, email, password } = req.body;

    if (!organizationId || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Organization, email, and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const admin = await createOrganizationAdmin({
      organizationId,
      email: email.trim().toLowerCase(),
      password,
    });

    return res.status(201).json({
      success: true,
      message: "Organization admin created successfully",
      admin,
    });
  } catch (error) {
    console.error("Create organization admin error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Internal server error";

    if (
      message === "Organization not found" ||
      message === "An admin with this email already exists"
    ) {
      return res.status(400).json({
        success: false,
        message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getOrganizationsController(
  _req: Request,
  res: Response
) {
  try {
    const organizations =
      await getOrganizationsForPlatformAdmin();

    return res.status(200).json({
      success: true,
      organizations,
    });
  } catch (error) {
    console.error("Get organizations error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}