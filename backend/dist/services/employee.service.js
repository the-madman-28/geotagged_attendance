"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmployee = createEmployee;
exports.getAllEmployees = getAllEmployees;
exports.getEmployeeById = getEmployeeById;
exports.updateEmployeeStatus = updateEmployeeStatus;
exports.resetEmployeeDeviceRegistration = resetEmployeeDeviceRegistration;
const prisma_1 = __importDefault(require("../config/prisma"));
async function createEmployee(data) {
    const organizationId = data.organizationId;
    const employeeId = data.employeeId.trim();
    const name = data.name.trim();
    if (!employeeId) {
        throw new Error("Employee ID is required");
    }
    if (!name) {
        throw new Error("Employee name is required");
    }
    const existingEmployee = await prisma_1.default.employee.findUnique({
        where: {
            organizationId_employeeId: {
                organizationId,
                employeeId,
            },
        },
    });
    if (existingEmployee) {
        throw new Error("Employee ID already exists");
    }
    const employee = await prisma_1.default.employee.create({
        data: {
            organizationId,
            employeeId,
            name,
            isActive: true,
        },
    });
    return employee;
}
async function getAllEmployees(organizationId) {
    const employees = await prisma_1.default.employee.findMany({
        where: {
            organizationId,
        },
        orderBy: {
            employeeId: "asc",
        },
        select: {
            employeeId: true,
            name: true,
            isActive: true,
            createdAt: true,
        },
    });
    return employees;
}
async function getEmployeeById(organizationId, employeeId) {
    const employee = await prisma_1.default.employee.findUnique({
        where: {
            organizationId_employeeId: {
                organizationId,
                employeeId,
            },
        },
        select: {
            employeeId: true,
            name: true,
            isActive: true,
            createdAt: true,
        },
    });
    if (!employee) {
        throw new Error("Employee not found");
    }
    return employee;
}
async function updateEmployeeStatus(organizationId, employeeId, isActive) {
    const employee = await prisma_1.default.employee.findUnique({
        where: {
            organizationId_employeeId: {
                organizationId,
                employeeId,
            },
        },
    });
    if (!employee) {
        throw new Error("Employee not found");
    }
    const updatedEmployee = await prisma_1.default.employee.update({
        where: {
            organizationId_employeeId: {
                organizationId,
                employeeId,
            },
        },
        data: {
            isActive,
        },
        select: {
            employeeId: true,
            name: true,
            isActive: true,
            createdAt: true,
        },
    });
    return updatedEmployee;
}
async function resetEmployeeDeviceRegistration(organizationId, employeeId) {
    const employee = await prisma_1.default.employee.findUnique({
        where: {
            organizationId_employeeId: {
                organizationId,
                employeeId,
            },
        },
        select: {
            id: true,
        },
    });
    if (!employee) {
        throw new Error("Employee not found");
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const result = await prisma_1.default.employeeDevice.deleteMany({
        where: {
            organizationId,
            employeeId: employee.id,
            registrationDate: today,
        },
    });
    return {
        deletedCount: result.count,
    };
}
