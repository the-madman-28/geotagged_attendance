"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeLogin = employeeLogin;
exports.adminLogin = adminLogin;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../config/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const JWT_SECRET = process.env.JWT_SECRET ?? "";
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
}
/**
 * Employee Login
 *
 * Login requires:
 * - organizationSlug
 * - employeeId
 * - deviceId
 */
async function employeeLogin(organizationSlug, employeeId, deviceId) {
    // Find organization first
    const organization = await prisma_1.default.organization.findUnique({
        where: {
            slug: organizationSlug,
        },
    });
    if (!organization) {
        throw new Error("Organization not found");
    }
    if (!organization.isActive) {
        throw new Error("Organization is inactive");
    }
    // Employee ID is unique only within an organization
    const employee = await prisma_1.default.employee.findUnique({
        where: {
            organizationId_employeeId: {
                organizationId: organization.id,
                employeeId,
            },
        },
    });
    if (!employee) {
        throw new Error("Employee not found");
    }
    if (!employee.isActive) {
        throw new Error("Employee account is inactive");
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    // Check whether this device is already registered
    // for any employee in this organization today.
    const existingDevice = await prisma_1.default.employeeDevice.findFirst({
        where: {
            organizationId: organization.id,
            deviceId,
            registrationDate: {
                gte: today,
                lt: tomorrow,
            },
        },
    });
    // Device belongs to another employee today
    if (existingDevice &&
        existingDevice.employeeId !== employee.id) {
        throw new Error("Device is already registered for another employee");
    }
    // Register device for this employee if not already registered today
    if (!existingDevice) {
        await prisma_1.default.employeeDevice.create({
            data: {
                organizationId: organization.id,
                deviceId,
                employeeId: employee.id,
                registrationDate: today,
            },
        });
    }
    // Employee JWT contains tenant information
    const token = jsonwebtoken_1.default.sign({
        employeeId: employee.employeeId,
        organizationId: organization.id,
        role: "EMPLOYEE",
    }, JWT_SECRET, {
        expiresIn: "12h",
    });
    return {
        token,
        employee: {
            employeeId: employee.employeeId,
            name: employee.name,
            organizationId: organization.id,
            organizationName: organization.name,
            organizationSlug: organization.slug,
        },
    };
}
/**
 * Admin Login
 *
 * Admin email is globally unique, so organization
 * can be obtained directly from the admin record.
 */
async function adminLogin(email, password) {
    const admin = await prisma_1.default.admin.findUnique({
        where: {
            email,
        },
        include: {
            organization: true,
        },
    });
    if (!admin) {
        throw new Error("Invalid admin credentials");
    }
    if (!admin.isActive) {
        throw new Error("Admin account is inactive");
    }
    if (!admin.organization.isActive) {
        throw new Error("Organization is inactive");
    }
    const isPasswordValid = await bcrypt_1.default.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
        throw new Error("Invalid admin credentials");
    }
    // Admin JWT also contains tenant information
    const token = jsonwebtoken_1.default.sign({
        adminId: admin.id,
        organizationId: admin.organizationId,
        role: "ADMIN",
    }, JWT_SECRET, {
        expiresIn: "12h",
    });
    return {
        token,
        admin: {
            id: admin.id,
            email: admin.email,
            organizationId: admin.organizationId,
            organizationName: admin.organization.name,
            organizationSlug: admin.organization.slug,
        },
    };
}
