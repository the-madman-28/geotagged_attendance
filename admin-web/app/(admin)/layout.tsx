"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/components/sidebar";
import Topbar from "@/components/topbar";
import { getAdminToken } from "@/lib/auth";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getAdminToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fb]">
        <p className="text-sm text-slate-500">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <Sidebar />

      <div className="lg:pl-64">
        <Topbar />

        <main className="p-5 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}