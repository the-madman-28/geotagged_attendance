import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import bcrypt from "bcrypt";

const JWT_SECRET: string = process.env.JWT_SECRET ?? "";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

export async function employeeLogin(
  employeeId: string,
  deviceId: string
) {
  const employee = await prisma.employee.findUnique({
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
  const existingDevice = await prisma.employeeDevice.findFirst({
    where: {
      deviceId,
      registrationDate: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  if (
    existingDevice &&
    existingDevice.employeeId !== employee.employeeId
  ) {
    throw new Error(
      "Device is already registered for another employee"
    );
  }

  // Register this device for the employee if not already registered today
  if (!existingDevice) {
    await prisma.employeeDevice.create({
      data: {
        deviceId,
        employeeId: employee.employeeId,
        registrationDate: today,
      },
    });
  }

  const token = jwt.sign(
    {
      employeeId: employee.employeeId,
      role: "EMPLOYEE",
    },
    JWT_SECRET,
    {
      expiresIn: "12h",
    }
  );

  return {
    token,
    employee: {
      employeeId: employee.employeeId,
      name: employee.name,
    },
  };
}

export async function adminLogin(
  email: string,
  password: string
) {
  const admin = await prisma.admin.findUnique({
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

  const isPasswordValid = await bcrypt.compare(
    password,
    admin.passwordHash
  );

  if (!isPasswordValid) {
    throw new Error("Invalid admin credentials");
  }

  const token = jwt.sign(
    {
      adminId: admin.id,
      role: "ADMIN",
    },
    JWT_SECRET,
    {
      expiresIn: "12h",
    }
  );

  return {
    token,
    admin: {
      id: admin.id,
      email: admin.email,
    },
  };
}