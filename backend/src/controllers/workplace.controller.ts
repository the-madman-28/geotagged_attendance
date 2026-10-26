import { Request, Response } from "express";
import {
  createWorkplace,
  getWorkplace,
  updateWorkplace,
} from "../services/workplace.service";
import { AuthenticatedAdminRequest } from "../middleware/adminAuth.middleware";

export async function createWorkplaceController(
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

    const {
      name,
      latitude,
      longitude,
      radiusMeters,
      maximumSessionHours,
    } = req.body;

    if (
      name === undefined ||
      latitude === undefined ||
      longitude === undefined ||
      radiusMeters === undefined ||
      maximumSessionHours === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, latitude, longitude, radiusMeters and maximumSessionHours are required",
      });
    }

    if (typeof name !== "string") {
      return res.status(400).json({
        success: false,
        message: "Workplace name must be a string",
      });
    }

    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      typeof radiusMeters !== "number" ||
      typeof maximumSessionHours !== "number"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Latitude, longitude, radiusMeters and maximumSessionHours must be numbers",
      });
    }

    const workplace = await createWorkplace({
      name,
      latitude,
      longitude,
      radiusMeters,
      maximumSessionHours,
    });

    return res.status(201).json({
      success: true,
      message: "Workplace created successfully",
      workplace,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message ===
        "An active workplace already exists"
      ) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message === "Workplace name is required" ||
        error.message === "Invalid latitude" ||
        error.message === "Invalid longitude" ||
        error.message ===
          "Radius must be greater than zero" ||
        error.message ===
          "Maximum session hours must be greater than zero"
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
    }

    console.error("Create workplace error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getWorkplaceController(
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

    const workplace = await getWorkplace();

    return res.status(200).json({
      success: true,
      workplace,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "No active workplace configured"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Get workplace error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function updateWorkplaceController(
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

    const {
      name,
      latitude,
      longitude,
      radiusMeters,
      maximumSessionHours,
    } = req.body;

    if (
      name === undefined ||
      latitude === undefined ||
      longitude === undefined ||
      radiusMeters === undefined ||
      maximumSessionHours === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, latitude, longitude, radiusMeters and maximumSessionHours are required",
      });
    }

    if (typeof name !== "string") {
      return res.status(400).json({
        success: false,
        message: "Workplace name must be a string",
      });
    }

    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      typeof radiusMeters !== "number" ||
      typeof maximumSessionHours !== "number"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Latitude, longitude, radiusMeters and maximumSessionHours must be numbers",
      });
    }

    const workplace = await updateWorkplace({
      name,
      latitude,
      longitude,
      radiusMeters,
      maximumSessionHours,
    });

    return res.status(200).json({
      success: true,
      message: "Workplace updated successfully",
      workplace,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "No active workplace configured"
      ) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message === "Workplace name is required" ||
        error.message === "Invalid latitude" ||
        error.message === "Invalid longitude" ||
        error.message ===
          "Radius must be greater than zero" ||
        error.message ===
          "Maximum session hours must be greater than zero"
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
    }

    console.error("Update workplace error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}