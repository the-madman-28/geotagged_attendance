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
async function employeeLogin(employeeId, deviceId) {
    const employee = await prisma_1.default.employee.findUnique({
        where: {
            employeeId,
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
    // Check whether this device is already registered today
    const existingDevice = await prisma_1.default.employeeDevice.findFirst({
        where: {
            deviceId,
            registrationDate: {
                gte: today,
                lt: tomorrow,
            },
        },
    });
    if (existingDevice &&
        existingDevice.employeeId !== employee.employeeId) {
        throw new Error("Device is already registered for another employee");
    }
    // Register this device for the employee if not already registered today
    if (!existingDevice) {
        await prisma_1.default.employeeDevice.create({
            data: {
                deviceId,
                employeeId: employee.employeeId,
                registrationDate: today,
            },
        });
    }
    const token = jsonwebtoken_1.default.sign({
        employeeId: employee.employeeId,
        role: "EMPLOYEE",
    }, JWT_SECRET, {
        expiresIn: "12h",
    });
    return {
        token,
        employee: {
            employeeId: employee.employeeId,
            name: employee.name,
        },
    };
}
async function adminLogin(email, password) {
    const admin = await prisma_1.default.admin.findUnique({
        where: {
            email,
        },
    });
    if (!admin) {
        throw new Error("Invalid admin credentials");
    }
    if (!admin.isActive) {
        throw new Error("Admin account is inactive");
    }
    const isPasswordValid = await bcrypt_1.default.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
        throw new Error("Invalid admin credentials");
    }
    const token = jsonwebtoken_1.default.sign({
        adminId: admin.id,
        role: "ADMIN",
    }, JWT_SECRET, {
        expiresIn: "12h",
    });
    return {
        token,
        admin: {
            id: admin.id,
            email: admin.email,
        },
    };
}
