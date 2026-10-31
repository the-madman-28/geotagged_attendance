"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  UserRound,
  X,
} from "lucide-react";

import {
  createEmployee,
  getEmployees,
} from "@/lib/employees";

import { Employee } from "@/types/employee";

type Filter = "ALL" | "ACTIVE" | "INACTIVE";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<Filter>("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreate, setShowCreate] =
    useState(false);

  const [newEmployeeId, setNewEmployeeId] =
    useState("");
  const [newEmployeeName, setNewEmployeeName] =
    useState("");

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] =
    useState("");

  async function loadEmployees() {
    try {
      setLoading(true);
      setError("");

      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load employees."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch =
        !query ||
        employee.employeeId
          .toLowerCase()
          .includes(query) ||
        employee.name
          .toLowerCase()
          .includes(query);

      const matchesFilter =
        filter === "ALL" ||
        (filter === "ACTIVE" &&
          employee.isActive) ||
        (filter === "INACTIVE" &&
          !employee.isActive);

      return matchesSearch && matchesFilter;
    });
  }, [employees, search, filter]);

  async function handleCreate(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setCreateError("");

    if (
      !newEmployeeId.trim() ||
      !newEmployeeName.trim()
    ) {
      setCreateError(
        "Employee ID and name are required."
      );
      return;
    }

    try {
      setCreating(true);

      await createEmployee(
        newEmployeeId.trim(),
        newEmployeeName.trim()
      );

      setNewEmployeeId("");
      setNewEmployeeName("");
      setShowCreate(false);

      await loadEmployees();
    } catch (error) {
      setCreateError(
        error instanceof Error
          ? error.message
          : "Unable to create employee."
      );
    } finally {
      setCreating(false);
    }
  }

  const activeCount = employees.filter(
    (employee) => employee.isActive
  ).length;

  const inactiveCount =
    employees.length - activeCount;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">
            Management
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Employees
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Create and manage employees registered in
            the attendance system.
          </p>
        </div>

        <button
          onClick={() => {
            setCreateError("");
            setShowCreate(true);
          }}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          <Plus size={17} />
          Add Employee
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Total Employees"
          value={employees.length}
        />

        <SummaryCard
          label="Active"
          value={activeCount}
        />

        <SummaryCard
          label="Inactive"
          value={inactiveCount}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search employee..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          <div className="flex gap-2">
            {(
              [
                ["ALL", "All"],
                ["ACTIVE", "Active"],
                ["INACTIVE", "Inactive"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  filter === value
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="m-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="flex items-center justify-between gap-4">
              <span>{error}</span>

              <button
                onClick={loadEmployees}
                className="font-medium underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Employee
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Name
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Status
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Created
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-sm text-slate-400"
                  >
                    Loading employees...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center"
                  >
                    <UserRound
                      size={28}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm font-medium text-slate-600">
                      No employees found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Try changing your search or filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr
                    key={employee.employeeId}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/employees/${encodeURIComponent(
                          employee.employeeId
                        )}`}
                        className="font-medium text-slate-900 hover:underline"
                      >
                        {employee.employeeId}
                      </Link>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {employee.name}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge
                        active={employee.isActive}
                      />
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-500">
                      {formatDate(employee.createdAt)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/employees/${encodeURIComponent(
                          employee.employeeId
                        )}`}
                        className="text-sm font-medium text-slate-700 hover:text-slate-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Add Employee
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Create a new employee account.
                </p>
              </div>

              <button
                onClick={() => setShowCreate(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleCreate}
              className="mt-6 space-y-4"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Employee ID
                </label>

                <input
                  value={newEmployeeId}
                  onChange={(event) =>
                    setNewEmployeeId(
                      event.target.value
                    )
                  }
                  placeholder="EMP005"
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Employee Name
                </label>

                <input
                  value={newEmployeeName}
                  onChange={(event) =>
                    setNewEmployeeName(
                      event.target.value
                    )
                  }
                  placeholder="Employee name"
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              {createError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                  {createError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="h-10 rounded-xl px-4 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {creating
                    ? "Creating..."
                    : "Create Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  active,
}: {
  active: boolean;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}