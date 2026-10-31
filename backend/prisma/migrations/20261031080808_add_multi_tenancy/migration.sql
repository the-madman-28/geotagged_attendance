/*
  SAFE MULTI-TENANCY MIGRATION

  Existing data will be assigned to:

    Organization:
      Test Workplace

    Slug:
      test-workplace
*/

-- ============================================================
-- 1. CREATE ORGANIZATIONS TABLE
-- ============================================================

CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "organizations_slug_key"
ON "organizations"("slug");


-- ============================================================
-- 2. CREATE THE INITIAL ORGANIZATION
-- ============================================================
-- Fixed UUID so all existing records can safely reference it.

INSERT INTO "organizations" (
    "id",
    "name",
    "slug",
    "isActive"
)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Test Workplace',
    'test-workplace',
    true
);


-- ============================================================
-- 3. REMOVE EXISTING FOREIGN KEYS THAT WILL CHANGE
-- ============================================================

ALTER TABLE "attendance"
DROP CONSTRAINT "attendance_employeeId_fkey";

ALTER TABLE "employee_devices"
DROP CONSTRAINT "employee_devices_employeeId_fkey";


-- ============================================================
-- 4. ADD NEW COLUMNS AS NULLABLE TEMPORARILY
-- ============================================================

ALTER TABLE "admins"
ADD COLUMN "organizationId" TEXT;

ALTER TABLE "employees"
ADD COLUMN "id" TEXT;

ALTER TABLE "employees"
ADD COLUMN "organizationId" TEXT;

ALTER TABLE "employee_devices"
ADD COLUMN "organizationId" TEXT;

ALTER TABLE "workplaces"
ADD COLUMN "organizationId" TEXT;

ALTER TABLE "attendance"
ADD COLUMN "organizationId" TEXT;


-- ============================================================
-- 5. GENERATE NEW UUID IDs FOR EXISTING EMPLOYEES
-- ============================================================

UPDATE "employees"
SET "id" = gen_random_uuid()::text
WHERE "id" IS NULL;


-- ============================================================
-- 6. ASSIGN ALL EXISTING DATA TO TEST WORKPLACE
-- ============================================================

UPDATE "admins"
SET "organizationId" = '00000000-0000-0000-0000-000000000001'
WHERE "organizationId" IS NULL;

UPDATE "employees"
SET "organizationId" = '00000000-0000-0000-0000-000000000001'
WHERE "organizationId" IS NULL;

UPDATE "employee_devices"
SET "organizationId" = '00000000-0000-0000-0000-000000000001'
WHERE "organizationId" IS NULL;

UPDATE "workplaces"
SET "organizationId" = '00000000-0000-0000-0000-000000000001'
WHERE "organizationId" IS NULL;

UPDATE "attendance"
SET "organizationId" = '00000000-0000-0000-0000-000000000001'
WHERE "organizationId" IS NULL;


-- ============================================================
-- 7. CONVERT EMPLOYEE FOREIGN KEYS
-- ============================================================
-- employee_devices.employeeId currently contains the old
-- employeeId value such as EMP001.
--
-- Replace it with the new Employee.id UUID.

ALTER TABLE "employee_devices"
ALTER COLUMN "employeeId" TYPE TEXT;


UPDATE "employee_devices" AS d
SET "employeeId" = e."id"
FROM "employees" AS e
WHERE d."employeeId" = e."employeeId"
  AND d."organizationId" = e."organizationId";


-- Attendance requires the same conversion.

UPDATE "attendance" AS a
SET "employeeId" = e."id"
FROM "employees" AS e
WHERE a."employeeId" = e."employeeId"
  AND a."organizationId" = e."organizationId";


-- ============================================================
-- 8. REMOVE OLD PRIMARY KEY
-- ============================================================

ALTER TABLE "employees"
DROP CONSTRAINT "employees_pkey";


-- ============================================================
-- 9. CREATE NEW EMPLOYEE PRIMARY KEY
-- ============================================================

ALTER TABLE "employees"
ADD CONSTRAINT "employees_pkey"
PRIMARY KEY ("id");


-- ============================================================
-- 10. MAKE NEW TENANT COLUMNS REQUIRED
-- ============================================================

ALTER TABLE "admins"
ALTER COLUMN "organizationId" SET NOT NULL;

ALTER TABLE "employees"
ALTER COLUMN "organizationId" SET NOT NULL;

ALTER TABLE "employee_devices"
ALTER COLUMN "organizationId" SET NOT NULL;

ALTER TABLE "workplaces"
ALTER COLUMN "organizationId" SET NOT NULL;

ALTER TABLE "attendance"
ALTER COLUMN "organizationId" SET NOT NULL;


-- ============================================================
-- 11. REMOVE OLD UNIQUE INDEXES
-- ============================================================

DROP INDEX "attendance_employeeId_attendanceDate_key";

DROP INDEX "employee_devices_deviceId_registrationDate_key";


-- ============================================================
-- 12. CREATE NEW UNIQUE CONSTRAINTS
-- ============================================================

CREATE UNIQUE INDEX
"employees_organizationId_employeeId_key"
ON "employees"("organizationId", "employeeId");

CREATE UNIQUE INDEX
"employee_devices_organizationId_deviceId_registrationDate_key"
ON "employee_devices"(
    "organizationId",
    "deviceId",
    "registrationDate"
);

CREATE UNIQUE INDEX
"attendance_organizationId_employeeId_attendanceDate_key"
ON "attendance"(
    "organizationId",
    "employeeId",
    "attendanceDate"
);


-- ============================================================
-- 13. CREATE TENANT INDEXES
-- ============================================================

CREATE INDEX "admins_organizationId_idx"
ON "admins"("organizationId");

CREATE INDEX "employees_organizationId_idx"
ON "employees"("organizationId");

CREATE INDEX "employee_devices_organizationId_idx"
ON "employee_devices"("organizationId");

CREATE INDEX "workplaces_organizationId_idx"
ON "workplaces"("organizationId");

CREATE INDEX "attendance_organizationId_idx"
ON "attendance"("organizationId");


-- ============================================================
-- 14. RESTORE FOREIGN KEYS
-- ============================================================

ALTER TABLE "admins"
ADD CONSTRAINT "admins_organizationId_fkey"
FOREIGN KEY ("organizationId")
REFERENCES "organizations"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;


ALTER TABLE "employees"
ADD CONSTRAINT "employees_organizationId_fkey"
FOREIGN KEY ("organizationId")
REFERENCES "organizations"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;


ALTER TABLE "employee_devices"
ADD CONSTRAINT "employee_devices_organizationId_fkey"
FOREIGN KEY ("organizationId")
REFERENCES "organizations"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;


ALTER TABLE "employee_devices"
ADD CONSTRAINT "employee_devices_employeeId_fkey"
FOREIGN KEY ("employeeId")
REFERENCES "employees"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;


ALTER TABLE "workplaces"
ADD CONSTRAINT "workplaces_organizationId_fkey"
FOREIGN KEY ("organizationId")
REFERENCES "organizations"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;


ALTER TABLE "attendance"
ADD CONSTRAINT "attendance_organizationId_fkey"
FOREIGN KEY ("organizationId")
REFERENCES "organizations"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;


ALTER TABLE "attendance"
ADD CONSTRAINT "attendance_employeeId_fkey"
FOREIGN KEY ("employeeId")
REFERENCES "employees"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;