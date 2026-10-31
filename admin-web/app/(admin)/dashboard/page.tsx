"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Clock3,
  LogIn,
  Users,
  UserCheck,
} from "lucide-react";

import { apiRequest } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";

interface DashboardSummary {
  totalEmployees: number;
  activeEmployees: number;
  totalAttendanceToday: number;
  currentlyPunchedIn: number;
  outOfRangeToday: number;
  autoPunchedOutToday: number;
}

interface DashboardResponse {
  success: boolean;
  summary: DashboardSummary;
}

const stats = [
  {
    key: "totalEmployees",
    label: "Total Employees",
    icon: Users,
  },
  {
    key: "activeEmployees",
    label: "Active Employees",
    icon: UserCheck,
  },
  {
    key: "totalAttendanceToday",
    label: "Attendance Today",
    icon: Activity,
  },
  {
    key: "currentlyPunchedIn",
    label: "Currently Punched In",
    icon: LogIn,
  },
  {
    key: "outOfRangeToday",
    label: "Out of Range",
    icon: AlertTriangle,
  },
  {
    key: "autoPunchedOutToday",
    label: "Auto Punched Out",
    icon: Clock3,
  },
] as const;

export default function DashboardPage() {
  const [summary, setSummary] =
    useState<DashboardSummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const token = getAdminToken();

      if (!token) {
        throw new Error("Admin authentication required");
      }

      const response =
        await apiRequest<DashboardResponse>(
          "/api/admin/dashboard/summary",
          {
            token,
          }
        );

      setSummary(response.summary);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <p className="text-sm font-medium text-slate-400">
          Overview
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Dashboard
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Monitor employee attendance and workplace activity.
        </p>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">
            {error}
          </p>

          <button
            onClick={loadDashboard}
            className="text-sm font-medium text-red-700 underline"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          const value =
            summary?.[stat.key] ?? 0;

          return (
            <div
              key={stat.key}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    {stat.label}
                  </p>

                  <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                    {loading ? "—" : value}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <Icon size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <Activity size={19} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Today's Activity
              </h2>

              <p className="text-sm text-slate-500">
                Attendance activity for today
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <ActivityRow
              label="Attendance records"
              value={
                loading
                  ? "—"
                  : summary?.totalAttendanceToday ?? 0
              }
            />

            <ActivityRow
              label="Currently punched in"
              value={
                loading
                  ? "—"
                  : summary?.currentlyPunchedIn ?? 0
              }
            />

            <ActivityRow
              label="Out-of-range records"
              value={
                loading
                  ? "—"
                  : summary?.outOfRangeToday ?? 0
              }
            />

            <ActivityRow
              label="Auto punched out"
              value={
                loading
                  ? "—"
                  : summary?.autoPunchedOutToday ?? 0
              }
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <Users size={19} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Employee Overview
              </h2>

              <p className="text-sm text-slate-500">
                Current employee status
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <ActivityRow
              label="Total employees"
              value={
                loading
                  ? "—"
                  : summary?.totalEmployees ?? 0
              }
            />

            <ActivityRow
              label="Active employees"
              value={
                loading
                  ? "—"
                  : summary?.activeEmployees ?? 0
              }
            />

            <ActivityRow
              label="Inactive employees"
              value={
                loading
                  ? "—"
                  : Math.max(
                      0,
                      (summary?.totalEmployees ?? 0) -
                        (summary?.activeEmployees ?? 0)
                    )
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityRow({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-sm font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
}