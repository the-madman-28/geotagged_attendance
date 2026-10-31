"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Power,
  RotateCcw,
  UserRound,
} from "lucide-react";

import {
  getEmployee,
  resetEmployeeDeviceRegistration,
  updateEmployeeStatus,
} from "@/lib/employees";

import { Employee } from "@/types/employee";

export default function EmployeeDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const employeeId = decodeURIComponent(
    String(params.employeeId)
  );

  const [employee, setEmployee] =
    useState<Employee | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusLoading, setStatusLoading] =
    useState(false);

  const [resetLoading, setResetLoading] =
    useState(false);

  const [message, setMessage] = useState("");

  async function loadEmployee() {
    try {
      setLoading(true);
      setError("");

      const data = await getEmployee(employeeId);
      setEmployee(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load employee."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployee();
  }, [employeeId]);

  async function handleStatusChange() {
    if (!employee) return;

    const nextStatus = !employee.isActive;

    const confirmed = window.confirm(
      nextStatus
        ? `Activate ${employee.employeeId}?`
        : `Deactivate ${employee.employeeId}?`
    );

    if (!confirmed) return;

    try {
      setStatusLoading(true);
      setMessage("");
      setError("");

      const updated =
        await updateEmployeeStatus(
          employee.employeeId,
          nextStatus
        );

      setEmployee(updated);

      setMessage(
        nextStatus
          ? "Employee activated successfully."
          : "Employee deactivated successfully."
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update employee status."
      );
    } finally {
      setStatusLoading(false);
    }
  }

  async function handleResetDevice() {
    if (!employee) return;

    const confirmed = window.confirm(
      `Reset today's device registration for ${employee.employeeId}?`
    );

    if (!confirmed) return;

    try {
      setResetLoading(true);
      setMessage("");
      setError("");

      const result =
        await resetEmployeeDeviceRegistration(
          employee.employeeId
        );

      setMessage(result.message);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to reset device registration."
      );
    } finally {
      setResetLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl">
        <p className="text-sm text-slate-500">
          Loading employee...
        </p>
      </div>
    );
  }

  if (error && !employee) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <Link
          href="/employees"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to employees
        </Link>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!employee) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href="/employees"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Back to employees
      </Link>

      <div>
        <p className="text-sm font-medium text-slate-400">
          Employee
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          {employee.name}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          {employee.employeeId}
        </p>
      </div>

      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
              <UserRound size={25} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Employee Information
              </h2>

              <p className="text-sm text-slate-500">
                Account information
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <InfoItem
              label="Employee ID"
              value={employee.employeeId}
            />

            <InfoItem
              label="Name"
              value={employee.name}
            />

            <InfoItem
              label="Status"
              value={
                employee.isActive
                  ? "Active"
                  : "Inactive"
              }
            />

            <InfoItem
              label="Created"
              value={formatDate(employee.createdAt)}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">
            Account Actions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage this employee.
          </p>

          <div className="mt-6 space-y-3">
            <button
              onClick={handleStatusChange}
              disabled={statusLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <Power size={17} />

              {statusLoading
                ? "Updating..."
                : employee.isActive
                ? "Deactivate Employee"
                : "Activate Employee"}
            </button>

            <button
              onClick={handleResetDevice}
              disabled={resetLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              <RotateCcw size={17} />

              {resetLoading
                ? "Resetting..."
                : "Reset Device Registration"}
            </button>
          </div>

          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <div className="flex gap-3">
              <KeyRound
                size={17}
                className="mt-0.5 shrink-0 text-slate-500"
              />

              <p className="text-xs leading-5 text-slate-500">
                Resetting the device registration only
                removes today's device registration. It
                does not remove the employee or attendance
                history.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              Attendance
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View attendance records for this employee.
            </p>
          </div>

          <button
            onClick={() =>
              router.push(
                `/attendance?employeeId=${encodeURIComponent(
                  employee.employeeId
                )}`
              )
            }
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            View Attendance
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-900">
        {value}
      </p>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}