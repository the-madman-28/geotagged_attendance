import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";

const JWT_SECRET: string = process.env.JWT_SECRET ?? "";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

export async function platformAdminLogin(
  email: string,
  password: string
) {
  const platformAdmin = await prisma.platformAdmin.findUnique({
    where: {
      email,
    },
  });

  if (!platformAdmin) {
    throw new Error("Invalid email or password");
  }

  if (!platformAdmin.isActive) {
    throw new Error("Platform admin account is inactive");
  }

  const passwordMatches = await bcrypt.compare(
    password,
    platformAdmin.passwordHash
  );

  if (!passwordMatches) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign(
    {
      platformAdminId: platformAdmin.id,
      role: "PLATFORM_ADMIN",
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return {
    token,
    platformAdmin: {
      id: platformAdmin.id,
      email: platformAdmin.email,
    },
  };
}

export async function createOrganizationAdmin({
  organizationId,
  email,
  password,
}: {
  organizationId: string;
  email: string;
  password: string;
}) {
  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
    },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  if (!organization.isActive) {
    throw new Error("Organization is inactive");
  }

  const existingAdmin = await prisma.admin.findUnique({
    where: {
      email,
    },
  });

  if (existingAdmin) {
    throw new Error("An admin with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.admin.create({
    data: {
      organizationId,
      email,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      isActive: true,
      createdAt: true,
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return admin;
}

export async function getOrganizationsForPlatformAdmin() {
  return prisma.organization.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: {
          admins: true,
          employees: true,
        },
      },
    },
  });
}