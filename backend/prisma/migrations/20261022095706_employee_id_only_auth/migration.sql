/*
  Warnings:

  - You are about to drop the column `email` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `employees` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "employees_email_key";

-- AlterTable
ALTER TABLE "employees" DROP COLUMN "email",
DROP COLUMN "passwordHash";
