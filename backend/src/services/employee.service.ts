import prisma from "../config/prisma";

interface CreateEmployeeData {
  employeeId: string;
  name: string;
}

export async function createEmployee(
  data: CreateEmployeeData
) {
  const employeeId = data.employeeId.trim();
  const name = data.name.trim();

  if (!employeeId) {
    throw new Error("Employee ID is required");
  }

  if (!name) {
    throw new Error("Employee name is required");
  }

  const existingEmployee =
    await prisma.employee.findUnique({
      where: {
        employeeId,
      },
    });

  if (existingEmployee) {
    throw new Error("Employee ID already exists");
  }

  const employee = await prisma.employee.create({
    data: {
      employeeId,
      name,
      isActive: true,
    },
  });

  return employee;
}
export async function getAllEmployees() {
  const employees = await prisma.employee.findMany({
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

export async function getEmployeeById(
  employeeId: string
) {
  const employee = await prisma.employee.findUnique({
    where: {
      employeeId,
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

export async function updateEmployeeStatus(
  employeeId: string,
  isActive: boolean
) {
  const employee = await prisma.employee.findUnique({
    where: {
      employeeId,
    },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  const updatedEmployee = await prisma.employee.update({
    where: {
      employeeId,
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