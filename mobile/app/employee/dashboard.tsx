// mobile/app/employee/dashboard.tsx

import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";

import { useAuth } from "../../src/context/AuthContext";
import {
  getAttendanceState,
  getAttendanceStateLabel,
} from "../../src/utils/attendanceStatus";
import {
  AttendanceRecord,
  getTodayAttendance,
} from "../../src/api/attendance";

function formatTime(value?: string | null) {
  if (!value) return "--";

  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DashboardScreen() {
  const {
    employee,
    token,
    loading: authLoading,
    logout,
  } = useAuth();

  const [attendance, setAttendance] =
    useState<AttendanceRecord | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadAttendance = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const result =
        await getTodayAttendance(token);

      setAttendance(result.attendance);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load attendance."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      loadAttendance();
    }, [loadAttendance])
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
    return null;
  }

  const state = getAttendanceState(attendance);
  const status = getAttendanceStateLabel(state);

  function handleAttendanceAction() {
    if (state === "NOT_MARKED") {
      router.push("/employee/punch_in");
      return;
    }

    if (state === "PUNCHED_IN") {
      router.push("/employee/punch_out");
      return;
    }

    Alert.alert(
      "Attendance Completed",
      "Today's attendance is already completed."
    );
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

        {/* Employee */}

        <View style={styles.employeeCard}>
          <Text style={styles.label}>
            EMPLOYEE ID
          </Text>

          <Text style={styles.employeeId}>
            {employee.employeeId}
          </Text>
        </View>

        {/* Attendance */}

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>
            TODAY'S ATTENDANCE
          </Text>

          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator />

              <Text style={styles.muted}>
                Checking attendance...
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.status}>
                {status}
              </Text>

              {error ? (
                <Text style={styles.error}>
                  {error}
                </Text>
              ) : (
                <View style={styles.times}>
                  <View>
                    <Text style={styles.timeLabel}>
                      Punch In
                    </Text>

                    <Text style={styles.time}>
                      {formatTime(
                        attendance?.punchIn
                      )}
                    </Text>
                  </View>

                  <View>
                    <Text style={styles.timeLabel}>
                      Punch Out
                    </Text>

                    <Text style={styles.time}>
                      {formatTime(
                        attendance?.punchOut
                      )}
                    </Text>
                  </View>
                </View>
              )}

              {attendance?.autoPunchedOut && (
                <View style={styles.notice}>
                  <Text style={styles.noticeText}>
                    Automatically punched out after
                    maximum session time.
                  </Text>
                </View>
              )}

              {state !== "COMPLETED" &&
                state !== "AUTO_PUNCHED_OUT" && (
                  <Pressable
                    onPress={handleAttendanceAction}
                    style={styles.primaryButton}
                  >
                    <Text
                      style={
                        styles.primaryButtonText
                      }
                    >
                      {state === "PUNCHED_IN"
                        ? "Punch Out"
                        : "Punch In"}
                    </Text>
                  </Pressable>
                )}
            </>
          )}
        </View>

        {/* Profile */}

        <Pressable
          onPress={() =>
            router.push("/employee/profile")
          }
          style={styles.historyCard}
        >
          <View>
            <Text style={styles.historyTitle}>
              My Profile
            </Text>

            <Text style={styles.muted}>
              View your employee information
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>

        {/* History */}

        <Pressable
          onPress={() =>
            router.push("/employee/history")
          }
          style={styles.historyCard}
        >
          <View>
            <Text style={styles.historyTitle}>
              Attendance History
            </Text>

            <Text style={styles.muted}>
              View your previous attendance
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },

  greeting: {
    fontSize: 14,
    color: "#6b7280",
  },

  name: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginTop: 3,
  },

  logoutButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: "#ffffff",
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  logoutText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#dc2626",
  },

  employeeCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
  },

  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: "#9ca3af",
  },

  employeeId: {
    fontSize: 21,
    fontWeight: "800",
    color: "#111827",
    marginTop: 6,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: "#9ca3af",
    marginBottom: 12,
  },

  status: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 18,
  },

  times: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
    marginBottom: 18,
  },

  timeLabel: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 5,
  },

  time: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },

  loading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
  },

  muted: {
    fontSize: 13,
    color: "#6b7280",
  },

  error: {
    color: "#dc2626",
    fontSize: 13,
    marginBottom: 15,
  },

  notice: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },

  noticeText: {
    fontSize: 12,
    lineHeight: 18,
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
    fontWeight: "700",
  },

  historyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  historyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 5,
  },

  arrow: {
    fontSize: 28,
    color: "#9ca3af",
  },
});