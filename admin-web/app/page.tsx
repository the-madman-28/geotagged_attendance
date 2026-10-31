"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { getAdminToken } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (getAdminToken()) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f7fb]">
      <p className="text-sm text-slate-500">
        Loading...
      </p>
    </div>
  );
}