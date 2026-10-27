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

    const onEmployeeLogin =
      firstSegment === "login";

    const onEmployeeArea =
      firstSegment === "employee";

    const onAdminLogin =
      firstSegment === "admin" &&
      secondSegment === "login";

    const onAdminArea =
      firstSegment === "admin" &&
      secondSegment !== "login";

    /*
     * Admin session
     */
    if (adminToken) {
      if (
        onAdminLogin ||
        (!onAdminArea &&
          !onEmployeeArea &&
          !onEmployeeLogin)
      ) {
        router.replace("/admin/dashboard");
      }

      return;
    }

    /*
     * Employee session
     */
    if (employeeToken) {
      if (
        onEmployeeLogin ||
        onAdminLogin ||
        (!onEmployeeArea &&
          !onAdminArea)
      ) {
        router.replace("/employee/dashboard");
      }

      return;
    }

    /*
     * No authenticated session
     */
    if (
      !onEmployeeLogin &&
      !onAdminLogin
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