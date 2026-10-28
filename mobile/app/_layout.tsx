import { Stack, router, useSegments } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import {
  AuthProvider,
  useAuth,
} from "../src/context/AuthContext";

import {
  AdminAuthProvider,
  useAdminAuth,
} from "../src/context/AdminAuthContext";

function NavigationGuard() {
  const {
    token: employeeToken,
    loading: employeeLoading,
  } = useAuth();

  const {
    token: adminToken,
    loading: adminLoading,
  } = useAdminAuth();

  const segments = useSegments();

  useEffect(() => {
    if (employeeLoading || adminLoading) {
      return;
    }

    const firstSegment = segments[0];
    const secondSegment = segments.at(1);

    const isRoot = !firstSegment;

    const isEmployeeLogin =
      firstSegment === "login";

    const isEmployeeArea =
      firstSegment === "employee";

    const isAdminLogin =
      firstSegment === "admin" &&
      secondSegment === "login";

    const isAdminArea =
      firstSegment === "admin" &&
      secondSegment !== "login";

    /*
     * ================================
     * ADMIN SESSION
     * ================================
     */
    if (adminToken) {
      if (
        isRoot ||
        isEmployeeLogin ||
        isAdminLogin
      ) {
        router.replace("/admin/dashboard");
      }

      return;
    }

    /*
     * ================================
     * EMPLOYEE SESSION
     * ================================
     */
    if (employeeToken) {
      if (
        isRoot ||
        isEmployeeLogin
      ) {
        router.replace("/employee/dashboard");
      }

      /*
       * Prevent an employee session from
       * entering the admin area.
       */
      if (isAdminArea || isAdminLogin) {
        router.replace("/employee/dashboard");
      }

      return;
    }

    /*
     * ================================
     * NO SESSION
     * ================================
     */
    if (
      !isEmployeeLogin &&
      !isAdminLogin
    ) {
      router.replace("/login");
    }
  }, [
    employeeToken,
    adminToken,
    employeeLoading,
    adminLoading,
    segments,
  ]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AdminAuthProvider>
          <NavigationGuard />
        </AdminAuthProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}