"use client";

import { useEffect, useState } from "react";
import { getAdmin } from "@/lib/auth";

export default function Topbar() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    const admin = getAdmin();

    if (admin) {
      setEmail(admin.email);
    }
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur">
      <div>
        <p className="text-sm text-slate-400">
          Administration
        </p>

        <h1 className="text-lg font-semibold text-slate-900">
          Geotagged Attendance
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-slate-800">
            Administrator
          </p>
          <p className="text-xs text-slate-400">
            {email}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
          A
        </div>
      </div>
    </header>
  );
}