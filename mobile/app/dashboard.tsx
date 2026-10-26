import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";

import { useAuth } from "../src/context/AuthContext";

import {
  getAttendanceState,
  getAttendanceStateLabel,
} from "../src/utils/attendanceStatus";

import {
  AttendanceRecord,
  getTodayAttendance,
} from "../src/api/attendance";

export default function DashboardScreen() {
  const {
    employee,
    token,
    loading: authLoading,
    logout,
  } = useAuth();

  const [todayAttendance, setTodayAttendance] =
    useState<AttendanceRecord | null>(null);

  const [loadingAttendance, setLoadingAttendance] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadTodayAttendance = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      setLoadingAttendance(true);
      setError(null);

      const result = await getTodayAttendance(token);

      setTodayAttendance(result.attendance);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load today's attendance.";

      setError(message);
    } finally {
      setLoadingAttendance(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      loadTodayAttendance();
    }, [loadTodayAttendance])
  );

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  if (authLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (!employee || !token) {
    router.replace("/login");
    return null;
  }

  const attendanceState =
    getAttendanceState(todayAttendance);

  const statusLabel =
    getAttendanceStateLabel(attendanceState);

  const isPunchedIn =
    attendanceState === "PUNCHED_IN";

  const isCompleted =
    attendanceState === "COMPLETED";

  const isAutoPunchedOut =
    attendanceState === "AUTO_PUNCHED_OUT";

  function getStatusDescription() {
    switch (attendanceState) {
      case "AUTO_PUNCHED_OUT":
        return "Your maximum session time was reached and you were automatically punched out.";

      case "PUNCHED_IN":
        return "You are currently marked as present.";

      case "COMPLETED":
        return "Today's attendance has been completed.";

      case "NOT_MARKED":
      default:
        return "You have not marked attendance today.";
    }
  }

  function handleAttendanceAction() {
    if (attendanceState === "NOT_MARKED") {
      router.push("/punch_in");
      return;
    }

    if (attendanceState === "PUNCHED_IN") {
      router.push("/punch_out");
      return;
    }

    if (
      attendanceState === "COMPLETED" ||
      attendanceState === "AUTO_PUNCHED_OUT"
    ) {
      Alert.alert(
        "Attendance Completed",
        "You have already completed today's attendance."
      );
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}

        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Welcome back
            </Text>

            <Text style={styles.name}>
              {employee.name}
            </Text>
          </View>

          <Pressable
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            <Text style={styles.logoutText}>
              Logout
            </Text>
          </Pressable>
        </View>

        {/* Employee Information */}

        <View style={styles.employeeCard}>
          <Text style={styles.cardLabel}>
            Employee ID
          </Text>

          <Text style={styles.employeeId}>
            {employee.employeeId}
          </Text>
        </View>

        {/* Today's Attendance */}

        <View style={styles.attendanceCard}>
          <Text style={styles.sectionLabel}>
            TODAY'S ATTENDANCE
          </Text>

          {loadingAttendance ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" />

              <Text style={styles.loadingText}>
                Checking attendance...
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.status}>
                {statusLabel}
              </Text>

              <Text style={styles.description}>
                {getStatusDescription()}
              </Text>

              {error && (
                <Text style={styles.errorText}>
                  {error}
                </Text>
              )}

              {!isCompleted &&
                !isAutoPunchedOut && (
                  <Pressable
                    onPress={handleAttendanceAction}
                    style={styles.primaryButton}
                  >
                    <Text
                      style={styles.primaryButtonText}
                    >
                      {isPunchedIn
                        ? "Punch Out"
                        : "Punch In"}
                    </Text>
                  </Pressable>
                )}
            </>
          )}
        </View>

        {/* Quick Actions */}

        <View style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>
            Quick Actions
          </Text>

          <Pressable
            onPress={() => router.push("/history")}
            style={styles.actionButton}
          >
            <Text style={styles.actionTitle}>
              Attendance History
            </Text>

            <Text style={styles.actionDescription}>
              View your previous attendance records
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },

  container: {
    padding: 20,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  greeting: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },

  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },

  logoutButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  logoutText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#dc2626",
  },

  employeeCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },

  cardLabel: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 6,
  },

  employeeId: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

  attendanceCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 22,
    marginBottom: 16,
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: "#6b7280",
    marginBottom: 12,
  },

  status: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },

  description: {
    fontSize: 14,
    lineHeight: 21,
    color: "#6b7280",
    marginBottom: 20,
  },

  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },

  loadingText: {
    fontSize: 14,
    color: "#6b7280",
  },

  primaryButton: {
    height: 52,
    borderRadius: 10,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },

  errorText: {
    fontSize: 13,
    color: "#dc2626",
    marginBottom: 14,
  },

  actionsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 14,
  },

  actionButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  actionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 5,
  },

  actionDescription: {
    fontSize: 13,
    color: "#6b7280",
  },
});