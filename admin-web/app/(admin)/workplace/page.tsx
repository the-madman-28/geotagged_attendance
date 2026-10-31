"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Edit3,
  Globe2,
  MapPin,
  RefreshCw,
  Save,
  Target,
} from "lucide-react";

import {
  createWorkplace,
  getWorkplace,
  updateWorkplace,
} from "@/lib/workplace";

interface WorkplaceForm {
  name: string;
  latitude: string;
  longitude: string;
  radiusMeters: string;
  maximumSessionHours: string;
}

const emptyForm: WorkplaceForm = {
  name: "",
  latitude: "",
  longitude: "",
  radiusMeters: "50",
  maximumSessionHours: "8",
};

function toNumber(value: string) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

function formatCoordinate(
  value: number | string
) {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return String(value);
  }

  return number.toFixed(7);
}

function formatNumber(
  value: number | string,
  decimals = 2
) {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return String(value);
  }

  return number.toFixed(decimals);
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function WorkplacePage() {
  const [workplace, setWorkplace] =
    useState<Awaited<
      ReturnType<typeof getWorkplace>
    > | null>(null);

  const [form, setForm] =
    useState<WorkplaceForm>(emptyForm);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [editing, setEditing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    loadWorkplace();
  }, []);

  async function loadWorkplace() {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const data = await getWorkplace();

      setWorkplace(data);

      setForm({
        name: data.name,
        latitude: String(data.latitude),
        longitude: String(data.longitude),
        radiusMeters: String(
          data.radiusMeters
        ),
        maximumSessionHours: String(
          data.maximumSessionHours
        ),
      });

      setEditing(false);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load workplace";

      if (
        message ===
        "No active workplace configured"
      ) {
        setWorkplace(null);
        setForm(emptyForm);
        setEditing(true);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  function updateField(
    field: keyof WorkplaceForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  }

  function validateForm() {
    const name = form.name.trim();

    if (!name) {
      return "Workplace name is required";
    }

    const latitude = toNumber(
      form.latitude
    );

    if (latitude === null) {
      return "Latitude must be a valid number";
    }

    if (latitude < -90 || latitude > 90) {
      return "Latitude must be between -90 and 90";
    }

    const longitude = toNumber(
      form.longitude
    );

    if (longitude === null) {
      return "Longitude must be a valid number";
    }

    if (
      longitude < -180 ||
      longitude > 180
    ) {
      return "Longitude must be between -180 and 180";
    }

    const radiusMeters = toNumber(
      form.radiusMeters
    );

    if (
      radiusMeters === null ||
      radiusMeters <= 0
    ) {
      return "Radius must be greater than zero";
    }

    const maximumSessionHours =
      toNumber(form.maximumSessionHours);

    if (
      maximumSessionHours === null ||
      maximumSessionHours <= 0
    ) {
      return "Maximum session hours must be greater than zero";
    }

    return null;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const latitude = toNumber(
      form.latitude
    );

    const longitude = toNumber(
      form.longitude
    );

    const radiusMeters = toNumber(
      form.radiusMeters
    );

    const maximumSessionHours =
      toNumber(form.maximumSessionHours);

    if (
      latitude === null ||
      longitude === null ||
      radiusMeters === null ||
      maximumSessionHours === null
    ) {
      setError(
        "Please enter valid workplace values"
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        latitude,
        longitude,
        radiusMeters,
        maximumSessionHours,
      };

      if (workplace) {
        const updated =
          await updateWorkplace(payload);

        setWorkplace(updated);

        setForm({
          name: updated.name,
          latitude: String(
            updated.latitude
          ),
          longitude: String(
            updated.longitude
          ),
          radiusMeters: String(
            updated.radiusMeters
          ),
          maximumSessionHours: String(
            updated.maximumSessionHours
          ),
        });

        setEditing(false);

        setSuccess(
          "Workplace updated successfully."
        );
      } else {
        const created =
          await createWorkplace(payload);

        setWorkplace(created);

        setForm({
          name: created.name,
          latitude: String(
            created.latitude
          ),
          longitude: String(
            created.longitude
          ),
          radiusMeters: String(
            created.radiusMeters
          ),
          maximumSessionHours: String(
            created.maximumSessionHours
          ),
        });

        setEditing(false);

        setSuccess(
          "Workplace created successfully."
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save workplace"
      );
    } finally {
      setSaving(false);
    }
  }

  function cancelEditing() {
    if (!workplace) {
      return;
    }

    setForm({
      name: workplace.name,
      latitude: String(
        workplace.latitude
      ),
      longitude: String(
        workplace.longitude
      ),
      radiusMeters: String(
        workplace.radiusMeters
      ),
      maximumSessionHours: String(
        workplace.maximumSessionHours
      ),
    });

    setEditing(false);
    setError("");
    setSuccess("");
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading workplace...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Location configuration
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Workplace
          </h1>

          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Configure the location where
            employees can mark attendance and
            define the allowed attendance radius.
          </p>
        </div>

        {workplace && !editing && (
          <button
            type="button"
            onClick={() => {
              setEditing(true);
              setError("");
              setSuccess("");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <Edit3 className="h-4 w-4" />
            Edit workplace
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />

          <div>
            <p className="font-medium">
              Unable to save workplace
            </p>

            <p className="mt-0.5">
              {error}
            </p>
          </div>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />

          <p className="font-medium">
            {success}
          </p>
        </div>
      )}

      {!workplace && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 text-amber-600" />

            <div>
              <p className="text-sm font-semibold text-amber-800">
                No workplace configured
              </p>

              <p className="mt-1 text-sm leading-6 text-amber-700">
                Create the active workplace
                location before employees can
                use location-based attendance.
              </p>
            </div>
          </div>
        </div>
      )}

      {workplace && !editing ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-slate-100 p-2.5">
                  <MapPin className="h-5 w-5 text-slate-600" />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Workplace
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {workplace.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-slate-100 p-2.5">
                  <Target className="h-5 w-5 text-slate-600" />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Allowed radius
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {formatNumber(
                      workplace.radiusMeters
                    )}{" "}
                    meters
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-slate-100 p-2.5">
                  <Clock3 className="h-5 w-5 text-slate-600" />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Maximum session
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {formatNumber(
                      workplace.maximumSessionHours
                    )}{" "}
                    hours
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-50 p-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Status
                  </p>

                  <p className="mt-1 text-sm font-semibold text-emerald-700">
                    {workplace.isActive
                      ? "Active"
                      : "Inactive"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-slate-100 p-2.5">
                    <Globe2 className="h-5 w-5 text-slate-600" />
                  </div>

                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      Geographic location
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Coordinates used for attendance
                      distance calculations.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 p-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Latitude
                  </p>

                  <p className="mt-2 font-mono text-sm font-medium text-slate-800">
                    {formatCoordinate(
                      workplace.latitude
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Longitude
                  </p>

                  <p className="mt-2 font-mono text-sm font-medium text-slate-800">
                    {formatCoordinate(
                      workplace.longitude
                    )}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                    <MapPin className="mt-0.5 h-5 w-5 text-slate-500" />

                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        Attendance geofence
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Employees are considered
                        within the workplace when
                        their GPS position is within{" "}
                        <span className="font-semibold text-slate-700">
                          {formatNumber(
                            workplace.radiusMeters
                          )}{" "}
                          meters
                        </span>{" "}
                        of these coordinates.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">
                  Configuration
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Current attendance rules.
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                <div className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      Radius
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Maximum distance from workplace
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-slate-900">
                    {formatNumber(
                      workplace.radiusMeters
                    )}{" "}
                    m
                  </p>
                </div>

                <div className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      Session limit
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Maximum attendance session
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-slate-900">
                    {formatNumber(
                      workplace.maximumSessionHours
                    )}{" "}
                    hrs
                  </p>
                </div>

                <div className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      Created
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Workplace configuration date
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-slate-900">
                    {formatDate(
                      workplace.createdAt
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-200 px-5 py-5">
            <h2 className="text-base font-semibold text-slate-900">
              {workplace
                ? "Edit workplace"
                : "Create workplace"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enter the location and attendance
              rules for your workplace.
            </p>
          </div>

          <div className="space-y-6 p-5">
            <div>
              <label
                htmlFor="workplace-name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Workplace name
              </label>

              <input
                id="workplace-name"
                type="text"
                value={form.name}
                onChange={(event) =>
                  updateField(
                    "name",
                    event.target.value
                  )
                }
                placeholder="Main Office"
                disabled={saving}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 disabled:bg-slate-50"
              />
            </div>

            <div>
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  Workplace coordinates
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Use decimal GPS coordinates.
                  Latitude ranges from -90 to 90
                  and longitude from -180 to 180.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="latitude"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Latitude
                  </label>

                  <input
                    id="latitude"
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={(event) =>
                      updateField(
                        "latitude",
                        event.target.value
                      )
                    }
                    placeholder="28.613939"
                    disabled={saving}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="longitude"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Longitude
                  </label>

                  <input
                    id="longitude"
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={(event) =>
                      updateField(
                        "longitude",
                        event.target.value
                      )
                    }
                    placeholder="77.209023"
                    disabled={saving}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 disabled:bg-slate-50"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="radius"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Allowed radius
                </label>

                <div className="relative">
                  <input
                    id="radius"
                    type="number"
                    min="0.01"
                    step="any"
                    value={
                      form.radiusMeters
                    }
                    onChange={(event) =>
                      updateField(
                        "radiusMeters",
                        event.target.value
                      )
                    }
                    placeholder="50"
                    disabled={saving}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-16 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 disabled:bg-slate-50"
                  />

                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                    meters
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Employees outside this radius
                  will be considered out of range.
                </p>
              </div>

              <div>
                <label
                  htmlFor="session-hours"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Maximum session hours
                </label>

                <div className="relative">
                  <input
                    id="session-hours"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={
                      form.maximumSessionHours
                    }
                    onChange={(event) =>
                      updateField(
                        "maximumSessionHours",
                        event.target.value
                      )
                    }
                    placeholder="8"
                    disabled={saving}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-16 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 disabled:bg-slate-50"
                  />

                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                    hours
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Sessions exceeding this duration
                  can be automatically closed by the
                  attendance system.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <Target className="mt-0.5 h-5 w-5 text-slate-500" />

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Location configuration
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    The mobile application will use
                    these coordinates and radius to
                    determine whether an employee is
                    inside the permitted attendance
                    area.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:justify-end">
            {workplace && (
              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {workplace
                    ? "Save changes"
                    : "Create workplace"}
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}