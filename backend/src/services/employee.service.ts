import prisma from "../config/prisma";

interface CreateEmployeeData {
  organizationId: string;
  employeeId: string;
  name: string;
}

export async function createEmployee(
  data: CreateEmployeeData
) {
  const organizationId = data.organizationId;
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
        organizationId_employeeId: {
          organizationId,
          employeeId,
        },
      },
    });

  if (existingEmployee) {
    throw new Error("Employee ID already exists");
  }

  const employee = await prisma.employee.create({
    data: {
      organizationId,
      employeeId,
      name,
      isActive: true,
    },
  });

  return employee;
}

export async function getAllEmployees(
  organizationId: string
) {
  const employees = await prisma.employee.findMany({
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

export async function getEmployeeById(
  organizationId: string,
  employeeId: string
) {
  const employee = await prisma.employee.findUnique({
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

export async function updateEmployeeStatus(
  organizationId: string,
  employeeId: string,
  isActive: boolean
) {
  const employee = await prisma.employee.findUnique({
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

  const updatedEmployee = await prisma.employee.update({
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

export async function resetEmployeeDeviceRegistration(
  organizationId: string,
  employeeId: string
) {
  const employee = await prisma.employee.findUnique({
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

  const result = await prisma.employeeDevice.deleteMany({
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