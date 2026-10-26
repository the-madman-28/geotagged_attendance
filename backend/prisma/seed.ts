import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Starting database seed...");

  // -------------------------
  // Admin
  // -------------------------

  const adminPassword = await bcrypt.hash("Admin@123", 10);

  const admin = await prisma.admin.upsert({
    where: {
      email: "admin@attendance.com",
    },
    update: {},
    create: {
      email: "admin@attendance.com",
      passwordHash: adminPassword,
      isActive: true,
    },
  });

  // -------------------------
  // Employee
  // -------------------------

  const employee = await prisma.employee.upsert({
    where: {
      employeeId: "EMP001",
    },
    update: {},
    create: {
      employeeId: "EMP001",
      name: "Test Employee",
      isActive: true,
    },
  });

  // -------------------------
  // Workplace
  // -------------------------

  const workplace = await prisma.workplace.upsert({
    where: {
      id: "00000000-0000-0000-0000-000000000001",
    },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Main Office",
      latitude: 28.6139,
      longitude: 77.2090,
      radiusMeters: 50,
      maximumSessionHours: 12,
      isActive: true,
    },
  });

  console.log("✅ Admin:", admin.email);
  console.log("✅ Employee:", employee.employeeId);
  console.log("✅ Workplace:", workplace.name);

  console.log("🌱 Database seed completed!");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });