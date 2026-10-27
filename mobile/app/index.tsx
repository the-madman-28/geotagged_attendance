import { Redirect } from "expo-router";

import { useAuth } from "../src/context/AuthContext";
import { useAdminAuth } from "../src/context/AdminAuthContext";

export default function Index() {
  const {
    token: employeeToken,
    loading: employeeLoading,
  } = useAuth();

  const {
    token: adminToken,
    loading: adminLoading,
  } = useAdminAuth();

  if (employeeLoading || adminLoading) {
    return null;
  }

  if (adminToken) {
    return <Redirect href="/admin/dashboard" />;
  }

  if (employeeToken) {
    return <Redirect href="/employee/dashboard" />;
  }

  return <Redirect href="/login" />;
}