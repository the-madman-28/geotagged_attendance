"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";

import {
  Activity,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  RefreshCw,
  Search,
  TimerOff,
  UserRound,
  X,
  XCircle,
} from "lucide-react";

import {
  getAttendanceByEmployee,
  getOutOfRangeAttendance,
  getTodayAttendance,
} from "@/lib/attendance";

import { getEmployees } from "@/lib/employees";

import {
  AttendanceRecord,
  OutOfRangeAttendanceRecord,
} from "@/types/attendance";

import { Employee } from "@/types/employee";

type ViewMode =
  | "today"
  | "employee"
  | "outOfRange";

type SelectedRecord =
  | AttendanceRecord
  | OutOfRangeAttendanceRecord
  | null;

/* =========================================================
   TYPE HELPERS
========================================================= */

function isFullAttendanceRecord(
  record:
    | AttendanceRecord
    | OutOfRangeAttendanceRecord
): record is AttendanceRecord {
  return (
    "punchInLatitude" in record &&
    "punchInLongitude" in record &&
    "punchInAccuracy" in record &&
    "punchOutLatitude" in record &&
    "punchOutLongitude" in record &&
    "punchOutAccuracy" in record
  );
}

/* =========================================================
   FORMATTERS
========================================================= */

function formatTime(value: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDistance(
  value: number | string | null
) {
  if (value === null || value === undefined) {
    return "—";
  }

  const distance = Number(value);

  if (Number.isNaN(distance)) {
    return "—";
  }

  return `${distance.toFixed(1)} m`;
}

function formatAccuracy(
  value: number | string | null
) {
  if (value === null || value === undefined) {
    return "—";
  }

  const accuracy = Number(value);

  if (Number.isNaN(accuracy)) {
    return "—";
  }

  return `${accuracy.toFixed(1)} m`;
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}: {
  status: string | null;
}) {
  if (status === "OUT_OF_RANGE") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
        <XCircle className="h-3.5 w-3.5" />
        Out of range
      </span>
    );
  }

  if (status === "IN_RANGE") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        In range
      </span>
    );
  }

  return (
    <span className="text-xs text-slate-400">
      —
    </span>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: number;
  icon: typeof Activity;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div className="rounded-xl bg-slate-100 p-2.5">
          <Icon className="h-5 w-5 text-slate-600" />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DETAIL ITEM
========================================================= */

function DetailItem({
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

      <p className="mt-1 break-words text-sm font-medium text-slate-700">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   ATTENDANCE DETAILS MODAL
========================================================= */

function AttendanceDetailsModal({
  record,
  onClose,
}: {
  record: SelectedRecord;
  onClose: () => void;
}) {
  if (!record) {
    return null;
  }

  const fullRecord =
    isFullAttendanceRecord(record)
      ? record
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Modal header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Attendance details
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {record.employee.name} ·{" "}
              {record.employee.employeeId}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-5">
          {/* =================================================
              BASIC INFORMATION
          ================================================== */}

          <div className="grid gap-4 sm:grid-cols-3">
            <DetailItem
              label="Date"
              value={formatDate(
                record.attendanceDate
              )}
            />

            <DetailItem
              label="Workplace"
              value={record.workplace.name}
            />

            <DetailItem
              label="Record ID"
              value={record.id}
            />
          </div>

          {/* =================================================
              PUNCH IN
          ================================================== */}

          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-emerald-50 p-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Punch in
                </h3>

                <p className="text-xs text-slate-500">
                  {formatTime(record.punchIn)}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailItem
                label="Status"
                value={
                  record.punchInStatus || "—"
                }
              />

              <DetailItem
                label="Distance"
                value={formatDistance(
                  record.punchInDistance
                )}
              />

              <DetailItem
                label="GPS accuracy"
                value={
                  fullRecord
                    ? formatAccuracy(
                        fullRecord.punchInAccuracy
                      )
                    : "Not available"
                }
              />

              <DetailItem
                label="Latitude"
                value={
                  fullRecord &&
                  fullRecord.punchInLatitude !==
                    null
                    ? String(
                        fullRecord.punchInLatitude
                      )
                    : "Not available"
                }
              />

              <DetailItem
                label="Longitude"
                value={
                  fullRecord &&
                  fullRecord.punchInLongitude !==
                    null
                    ? String(
                        fullRecord.punchInLongitude
                      )
                    : "Not available"
                }
              />

              <DetailItem
                label="Reason"
                value={
                  record.punchInReason || "—"
                }
              />
            </div>

            {!fullRecord && (
              <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                Detailed GPS coordinates and
                accuracy are not included in the
                out-of-range attendance response.
              </p>
            )}
          </div>

          {/* =================================================
              PUNCH OUT
          ================================================== */}

          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-slate-100 p-2">
                <Clock3 className="h-4 w-4 text-slate-600" />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Punch out
                </h3>

                <p className="text-xs text-slate-500">
                  {formatTime(record.punchOut)}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailItem
                label="Status"
                value={
                  record.punchOutStatus || "—"
                }
              />

              <DetailItem
                label="Distance"
                value={formatDistance(
                  record.punchOutDistance
                )}
              />

              <DetailItem
                label="GPS accuracy"
                value={
                  fullRecord
                    ? formatAccuracy(
                        fullRecord.punchOutAccuracy
                      )
                    : "Not available"
                }
              />

              <DetailItem
                label="Latitude"
                value={
                  fullRecord &&
                  fullRecord.punchOutLatitude !==
                    null
                    ? String(
                        fullRecord.punchOutLatitude
                      )
                    : "Not available"
                }
              />

              <DetailItem
                label="Longitude"
                value={
                  fullRecord &&
                  fullRecord.punchOutLongitude !==
                    null
                    ? String(
                        fullRecord.punchOutLongitude
                      )
                    : "Not available"
                }
              />

              <DetailItem
                label="Reason"
                value={
                  record.punchOutReason || "—"
                }
              />
            </div>

            {!fullRecord && (
              <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                Detailed GPS coordinates and
                accuracy are not included in the
                out-of-range attendance response.
              </p>
            )}
          </div>

          {/* =================================================
              AUTO PUNCH OUT
          ================================================== */}

          {record.autoPunchedOut && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <TimerOff className="mt-0.5 h-5 w-5 text-amber-600" />

              <div>
                <p className="text-sm font-semibold text-amber-800">
                  Automatically punched out
                </p>

                <p className="mt-1 text-xs leading-5 text-amber-700">
                  This attendance session was
                  automatically closed by the
                  system.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function AttendancePage() {
  const searchParams = useSearchParams();

  const initialEmployeeId =
    searchParams.get("employeeId") || "";

  const [view, setView] =
    useState<ViewMode>(
      initialEmployeeId
        ? "employee"
        : "today"
    );

  const [employees, setEmployees] =
    useState<Employee[]>([]);

  const [employeeId, setEmployeeId] =
    useState(initialEmployeeId);

  const [todayAttendance, setTodayAttendance] =
    useState<AttendanceRecord[]>([]);

  const [
    employeeAttendance,
    setEmployeeAttendance,
  ] = useState<AttendanceRecord[]>([]);

  const [
    outOfRangeAttendance,
    setOutOfRangeAttendance,
  ] = useState<
    OutOfRangeAttendanceRecord[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [selectedRecord, setSelectedRecord] =
    useState<SelectedRecord>(null);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadEmployees();
    loadToday();
  }, []);

  /* =======================================================
     VIEW LOAD
  ======================================================= */

  useEffect(() => {
    if (
      view === "employee" &&
      employeeId
    ) {
      loadEmployeeAttendance(employeeId);
    }

    if (view === "outOfRange") {
      loadOutOfRange();
    }
  }, [view, employeeId]);

  /* =======================================================
     API LOADERS
  ======================================================= */

  async function loadEmployees() {
    try {
      const data = await getEmployees();

      setEmployees(data);
    } catch (err) {
      console.error(
        "Load employees error:",
        err
      );
    }
  }

  async function loadToday() {
    try {
      setError("");

      const data =
        await getTodayAttendance();

      setTodayAttendance(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load attendance"
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadEmployeeAttendance(
    id: string
  ) {
    try {
      setLoading(true);
      setError("");

      const data =
        await getAttendanceByEmployee(id);

      setEmployeeAttendance(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load employee attendance"
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadOutOfRange() {
    try {
      setLoading(true);
      setError("");

      const data =
        await getOutOfRangeAttendance();

      setOutOfRangeAttendance(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load out-of-range attendance"
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     REFRESH
  ======================================================= */

  async function refresh() {
    setRefreshing(true);

    try {
      if (view === "today") {
        await loadToday();
      } else if (
        view === "employee" &&
        employeeId
      ) {
        await loadEmployeeAttendance(
          employeeId
        );
      } else if (view === "outOfRange") {
        await loadOutOfRange();
      }
    } finally {
      setRefreshing(false);
    }
  }

  /* =======================================================
     VIEW CHANGE
  ======================================================= */

  function changeView(nextView: ViewMode) {
    setSearch("");
    setError("");
    setView(nextView);
  }

  /* =======================================================
     ACTIVE RECORDS
  ======================================================= */

  const records = useMemo(() => {
    if (view === "today") {
      return todayAttendance;
    }

    if (view === "employee") {
      return employeeAttendance;
    }

    return outOfRangeAttendance;
  }, [
    view,
    todayAttendance,
    employeeAttendance,
    outOfRangeAttendance,
  ]);

  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredRecords =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return records;
      }

      return records.filter((record) => {
        return (
          record.employee.employeeId
            .toLowerCase()
            .includes(query) ||
          record.employee.name
            .toLowerCase()
            .includes(query) ||
          record.workplace.name
            .toLowerCase()
            .includes(query)
        );
      });
    }, [records, search]);

  /* =======================================================
     SUMMARY
  ======================================================= */

  const summary = useMemo(() => {
    const total = records.length;

    const punchedIn = records.filter(
      (record) =>
        Boolean(record.punchIn) &&
        !record.punchOut
    ).length;

    const completed = records.filter(
      (record) =>
        Boolean(record.punchIn) &&
        Boolean(record.punchOut)
    ).length;

    const outOfRange = records.filter(
      (record) =>
        record.punchInStatus ===
          "OUT_OF_RANGE" ||
        record.punchOutStatus ===
          "OUT_OF_RANGE"
    ).length;

    const autoPunchedOut =
      records.filter(
        (record) =>
          record.autoPunchedOut
      ).length;

    return {
      total,
      punchedIn,
      completed,
      outOfRange,
      autoPunchedOut,
    };
  }, [records]);

  /* =======================================================
     SELECTED EMPLOYEE
  ======================================================= */

  const selectedEmployee =
    employees.find(
      (employee) =>
        employee.employeeId === employeeId
    );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <div className="space-y-6">
        {/* =================================================
            HEADER
        ================================================== */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Attendance management
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              Attendance
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Monitor employee attendance,
              location status and punch activity.
            </p>
          </div>

          <button
            type="button"
            onClick={refresh}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </button>
        </div>

        {/* =================================================
            VIEW SELECTOR
        ================================================== */}

        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                changeView("today")
              }
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                view === "today"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Today
            </button>

            <button
              type="button"
              onClick={() =>
                changeView("employee")
              }
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                view === "employee"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Employee history
            </button>

            <button
              type="button"
              onClick={() =>
                changeView("outOfRange")
              }
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                view === "outOfRange"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
              Out of range
            </button>
          </div>

          {view === "employee" && (
            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-slate-400" />

              <select
                value={employeeId}
                onChange={(event) =>
                  setEmployeeId(
                    event.target.value
                  )
                }
                className="min-w-[230px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400"
              >
                <option value="">
                  Select employee
                </option>

                {employees.map(
                  (employee) => (
                    <option
                      key={
                        employee.employeeId
                      }
                      value={
                        employee.employeeId
                      }
                    >
                      {employee.name} (
                      {
                        employee.employeeId
                      }
                      )
                    </option>
                  )
                )}
              </select>
            </div>
          )}
        </div>

        {/* =================================================
            SELECTED EMPLOYEE
        ================================================== */}

        {view === "employee" &&
          selectedEmployee && (
            <div className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Employee
                </p>

                <p className="mt-1 text-base font-semibold text-slate-900">
                  {selectedEmployee.name}
                </p>
              </div>

              <p className="text-sm text-slate-500">
                ID:{" "}
                <span className="font-medium text-slate-700">
                  {selectedEmployee.employeeId}
                </span>
              </p>
            </div>
          )}

        {/* =================================================
            STATS
        ================================================== */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Total records"
            value={summary.total}
            icon={Activity}
            description="Attendance records"
          />

          <StatCard
            title="Currently punched in"
            value={summary.punchedIn}
            icon={Clock3}
            description="No punch-out yet"
          />

          <StatCard
            title="Completed"
            value={summary.completed}
            icon={CheckCircle2}
            description="Punch-in and punch-out"
          />

          <StatCard
            title="Out of range"
            value={summary.outOfRange}
            icon={AlertTriangle}
            description="Location exceptions"
          />

          <StatCard
            title="Auto punched out"
            value={summary.autoPunchedOut}
            icon={TimerOff}
            description="Automatically closed"
          />
        </div>

        {/* =================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />

            <div>
              <p className="font-medium">
                Unable to load attendance
              </p>

              <p className="mt-0.5">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* =================================================
            SEARCH
        ================================================== */}

        {!loading &&
          records.length > 0 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search employee or workplace..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-400"
                />
              </div>

              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-medium text-slate-700">
                  {filteredRecords.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-700">
                  {records.length}
                </span>{" "}
                records
              </p>
            </div>
          )}

        {/* =================================================
            TABLE
        ================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  {view === "today"
                    ? "Today's attendance"
                    : view ===
                        "employee"
                      ? "Employee attendance history"
                      : "Out-of-range attendance"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {view === "today"
                    ? "Attendance records created today."
                    : view ===
                        "employee"
                      ? "Historical attendance for the selected employee."
                      : "Attendance records containing location exceptions."}
                </p>
              </div>

              <CalendarDays className="h-5 w-5 text-slate-400" />
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Loading attendance...
              </div>
            </div>
          ) : view === "employee" &&
            !employeeId ? (
            /* Employee not selected */
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="rounded-full bg-slate-100 p-4">
                <UserRound className="h-6 w-6 text-slate-500" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                Select an employee
              </h3>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Choose an employee above to
                view their attendance history.
              </p>
            </div>
          ) : filteredRecords.length ===
            0 ? (
            /* Empty */
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="rounded-full bg-slate-100 p-4">
                <Activity className="h-6 w-6 text-slate-400" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                No attendance records
              </h3>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                There are no records matching
                the current view or search.
              </p>
            </div>
          ) : (
            /* Data */
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Employee
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Date
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Punch in
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Punch out
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Location
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Workplace
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map(
                    (record) => (
                      <tr
                        key={record.id}
                        className="transition hover:bg-slate-50"
                      >
                        {/* Employee */}
                        <td className="px-5 py-4">
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {
                                record
                                  .employee
                                  .name
                              }
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500">
                              {
                                record
                                  .employee
                                  .employeeId
                              }
                            </p>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4 text-sm text-slate-600">
                          {formatDate(
                            record.attendanceDate
                          )}
                        </td>

                        {/* Punch in */}
                        <td className="px-5 py-4">
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {formatTime(
                                record.punchIn
                              )}
                            </p>

                            <div className="mt-1">
                              <StatusBadge
                                status={
                                  record.punchInStatus
                                }
                              />
                            </div>
                          </div>
                        </td>

                        {/* Punch out */}
                        <td className="px-5 py-4">
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {formatTime(
                                record.punchOut
                              )}
                            </p>

                            {record.autoPunchedOut && (
                              <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                                <TimerOff className="h-3.5 w-3.5" />
                                Auto closed
                              </span>
                            )}

                            {!record.autoPunchedOut &&
                              record.punchOut && (
                                <div className="mt-1">
                                  <StatusBadge
                                    status={
                                      record.punchOutStatus
                                    }
                                  />
                                </div>
                              )}
                          </div>
                        </td>

                        {/* Location */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-slate-400" />

                            <div>
                              <p className="text-xs font-medium text-slate-700">
                                In:{" "}
                                {formatDistance(
                                  record.punchInDistance
                                )}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-400">
                                Out:{" "}
                                {formatDistance(
                                  record.punchOutDistance
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Workplace */}
                        <td className="px-5 py-4 text-sm text-slate-600">
                          {record.workplace.name}
                        </td>

                        {/* Action */}
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedRecord(
                                record
                              )
                            }
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ===================================================
          DETAILS MODAL
      ==================================================== */}

      <AttendanceDetailsModal
        record={selectedRecord}
        onClose={() =>
          setSelectedRecord(null)
        }
      />
    </>
  );
}