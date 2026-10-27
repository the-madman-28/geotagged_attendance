import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import {
  AdminDashboardSummary,
  getAdminDashboardSummary,
} from "../../src/api/admin";
import { useAdminAuth } from "../../src/context/AdminAuthContext";

export default function AdminDashboardScreen() {
  const { token, admin, logout } = useAdminAuth();

  const [summary, setSummary] =
    useState<AdminDashboardSummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(
    async (isRefresh = false) => {
      if (!token) {
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response =
          await getAdminDashboardSummary(token);

        setSummary(response.summary);
      } catch (err: any) {
        setError(
          err?.message ||
            "Failed to load dashboard."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard])
  );

  const handleLogout = async () => {
    await logout();
    router.replace("/admin/login");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color="#2563eb"
          />

          <Text style={styles.loadingText}>
            Loading dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadDashboard(true)}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>
              Admin Dashboard
            </Text>

            <Text style={styles.subtitle}>
              {admin?.email || "Administrator"}
            </Text>
          </View>

          <Pressable
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>
              Logout
            </Text>
          </Pressable>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              {error}
            </Text>

            <Pressable
              style={styles.retryButton}
              onPress={() => loadDashboard()}
            >
              <Text style={styles.retryText}>
                Retry
              </Text>
            </Pressable>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>
          Overview
        </Text>

        <View style={styles.grid}>
          <MetricCard
            title="Employees"
            value={summary?.totalEmployees ?? 0}
          />

          <MetricCard
            title="Active"
            value={summary?.activeEmployees ?? 0}
          />

          <MetricCard
            title="Present Today"
            value={summary?.presentToday ?? 0}
          />

          <MetricCard
            title="Punched In"
            value={summary?.punchedInToday ?? 0}
          />

          <MetricCard
            title="Completed"
            value={summary?.completedToday ?? 0}
          />

          <MetricCard
            title="Out of Range"
            value={summary?.outOfRangeToday ?? 0}
          />
        </View>

        <Text style={styles.sectionTitle}>
          Management
        </Text>

        <View style={styles.managementList}>
          <ManagementCard
            title="Employees"
            description="Add, view and manage employees"
            onPress={() =>
              router.push("/admin/employees")
            }
          />

          <ManagementCard
            title="Workplace"
            description="Configure location and geofence"
            onPress={() =>
              router.push("/admin/workplace")
            }
          />

          <ManagementCard
            title="Attendance"
            description="View today's attendance records"
            onPress={() =>
              router.push("/admin/attendance")
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricValue}>
        {value}
      </Text>

      <Text style={styles.metricTitle}>
        {title}
      </Text>
    </View>
  );
}

function ManagementCard({
  title,
  description,
  onPress,
}: {
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.managementCard}
      onPress={onPress}
    >
      <View style={styles.managementContent}>
        <Text style={styles.managementTitle}>
          {title}
        </Text>

        <Text style={styles.managementDescription}>
          {description}
        </Text>
      </View>

      <Text style={styles.arrow}>
        →
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  container: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },

  headerContent: {
    flex: 1,
    paddingRight: 12,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0f172a",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 13,
    color: "#64748b",
  },

  logoutButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: "#fee2e2",
  },

  logoutText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#b91c1c",
  },

  sectionTitle: {
    marginBottom: 12,
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 28,
  },

  metricCard: {
    width: "47%",
    minHeight: 105,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    justifyContent: "center",
  },

  metricValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2563eb",
  },

  metricTitle: {
    marginTop: 5,
    fontSize: 13,
    color: "#64748b",
  },

  managementList: {
    gap: 12,
  },

  managementCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  managementContent: {
    flex: 1,
    paddingRight: 12,
  },

  managementTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },

  managementDescription: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748b",
  },

  arrow: {
    fontSize: 22,
    color: "#2563eb",
  },

  errorBox: {
    marginBottom: 20,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },

  errorText: {
    fontSize: 13,
    color: "#b91c1c",
  },

  retryButton: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 7,
    backgroundColor: "#fee2e2",
  },

  retryText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#991b1b",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#64748b",
  },
});