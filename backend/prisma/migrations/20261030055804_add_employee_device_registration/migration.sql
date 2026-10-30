-- CreateTable
CREATE TABLE "employee_devices" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "registrationDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_devices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "employee_devices_employeeId_idx" ON "employee_devices"("employeeId");

-- CreateIndex
CREATE INDEX "employee_devices_deviceId_registrationDate_idx" ON "employee_devices"("deviceId", "registrationDate");

-- CreateIndex
CREATE UNIQUE INDEX "employee_devices_deviceId_registrationDate_key" ON "employee_devices"("deviceId", "registrationDate");

-- AddForeignKey
ALTER TABLE "employee_devices" ADD CONSTRAINT "employee_devices_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("employeeId") ON DELETE CASCADE ON UPDATE CASCADE;
