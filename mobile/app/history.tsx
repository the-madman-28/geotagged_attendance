import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

import { useAuth } from "../src/context/AuthContext";
import {
  AttendanceRecord,
  getAttendanceHistory,
} from "../src/api/attendance";

export default function HistoryScreen() {
  const { token } = useAuth();

  const [attendance, setAttendance] = useState<
    AttendanceRecord[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(
    null
  );

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result =
        await getAttendanceHistory(token);

      setAttendance(result.attendance);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load attendance history.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  function formatTime(date: string | null | undefined) {
    if (!date) {
      return "--";
    }

    return new Date(date).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  function getStatus(record: AttendanceRecord) {
    if (record.autoPunchedOut) {
      return "Auto Punched Out";
    }

    if (!record.punchOut) {
      return "Currently Punched In";
    }

    return "Completed";
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>
              ← Back
            </Text>
          </Pressable>

          <Text style={styles.title}>
            Attendance History
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" />

            <Text style={styles.loadingText}>
              Loading attendance...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>
              {error}
            </Text>

            <Pressable
              style={styles.retryButton}
              onPress={loadHistory}
            >
              <Text style={styles.retryText}>
                Try Again
              </Text>
            </Pressable>
          </View>
        ) : attendance.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyIcon}>
              📋
            </Text>

            <Text style={styles.emptyTitle}>
              No Attendance Records
            </Text>

            <Text style={styles.emptyDescription}>
              Your attendance records will appear
              here after you mark attendance.
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          >
            {attendance.map((record) => (
              <View
                key={record.id}
                style={styles.card}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.date}>
                    {formatDate(
                      record.attendanceDate
                    )}
                  </Text>

                  <View
                    style={[
                      styles.statusBadge,
                      record.autoPunchedOut &&
                        styles.autoBadge,
                    ]}
                  >
                    <Text
                      style={styles.statusText}
                    >
                      {getStatus(record)}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.timeRow}>
                  <View>
                    <Text style={styles.label}>
                      Punch In
                    </Text>

                    <Text style={styles.time}>
                      {formatTime(
                        record.punchIn
                      )}
                    </Text>
                  </View>

                  <View>
                    <Text style={styles.label}>
                      Punch Out
                    </Text>

                    <Text style={styles.time}>
                      {formatTime(
                        record.punchOut
                      )}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.locationRow}>
                  <Text style={styles.label}>
                    Punch In Status
                  </Text>

                  <Text style={styles.value}>
                    {record.punchInStatus}
                  </Text>
                </View>

                {record.punchInReason && (
                  <View style={styles.reasonContainer}>
                    <Text style={styles.label}>
                      Punch In Reason
                    </Text>

                    <Text style={styles.reason}>
                      {record.punchInReason}
                    </Text>
                  </View>
                )}

                {record.punchOutStatus && (
                  <View style={styles.locationRow}>
                    <Text style={styles.label}>
                      Punch Out Status
                    </Text>

                    <Text style={styles.value}>
                      {record.punchOutStatus}
                    </Text>
                  </View>
                )}

                {record.punchOutReason && (
                  <View style={styles.reasonContainer}>
                    <Text style={styles.label}>
                      Punch Out Reason
                    </Text>

                    <Text style={styles.reason}>
                      {record.punchOutReason}
                    </Text>
                  </View>
                )}

                {record.autoPunchedOut && (
                  <View style={styles.autoNotice}>
                    <Text style={styles.autoNoticeText}>
                      This session was automatically
                      closed after the maximum session
                      duration.
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },

  container: {
    flex: 1,
  },

  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  backText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2563eb",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  headerSpacer: {
    width: 50,
  },

  list: {
    padding: 20,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  date: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#dcfce7",
  },

  autoBadge: {
    backgroundColor: "#fef3c7",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },

  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 16,
  },

  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  label: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },

  time: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },

  locationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  value: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },

  reasonContainer: {
    marginTop: 4,
    marginBottom: 10,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f9fafb",
  },

  reason: {
    fontSize: 13,
    lineHeight: 19,
    color: "#374151",
  },

  autoNotice: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fffbeb",
  },

  autoNoticeText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#92400e",
  },

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },

  emptyIcon: {
    fontSize: 42,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },

  emptyDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: "#6b7280",
    textAlign: "center",
  },

  errorText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 18,
  },

  retryButton: {
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 8,
    backgroundColor: "#2563eb",
  },

  retryText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});