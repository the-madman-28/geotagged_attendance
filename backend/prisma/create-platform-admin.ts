import "dotenv/config";
import bcrypt from "bcrypt";
import prisma from "../src/config/prisma";

async function main() {
  const email = "platform@attendance.com";
  const password = "ChangeMe123!";

  const existing = await prisma.platformAdmin.findUnique({
    where: {
      email,
    },
  });

  if (existing) {
    console.log("Platform admin already exists.");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const platformAdmin = await prisma.platformAdmin.create({
    data: {
      email,
      passwordHash,
    },
  });

  console.log("Platform admin created:");
  console.log({
    id: platformAdmin.id,
    email,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });