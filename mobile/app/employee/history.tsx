import { useCallback, useState } from "react";
import {
  ActivityIndicator,
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
  AttendanceRecord,
  getAttendanceHistory,
} from "../../src/api/attendance";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value?: string | null) {
  if (!value) return "--";

  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusText(record: AttendanceRecord) {
  if (record.autoPunchedOut) {
    return "Auto Punched Out";
  }

  if (record.punchInStatus === "OUT_OF_RANGE") {
    return "Punch In - Outside Workplace";
  }

  if (record.punchOutStatus === "OUT_OF_RANGE") {
    return "Punch Out - Outside Workplace";
  }

  return "Completed";
}

export default function HistoryScreen() {
  const { token } = useAuth();

  const [records, setRecords] = useState<
    AttendanceRecord[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const result =
        await getAttendanceHistory(token);

      setRecords(result.attendance);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load attendance history."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>

        <Text style={styles.title}>
          Attendance History
        </Text>

        <View style={styles.spacer} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />

          <Text style={styles.muted}>
            Loading attendance...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>
            {error}
          </Text>

          <Pressable
            onPress={loadHistory}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>
              Try Again
            </Text>
          </Pressable>
        </View>
      ) : records.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>
            📅
          </Text>

          <Text style={styles.emptyTitle}>
            No Attendance Yet
          </Text>

          <Text style={styles.muted}>
            Your attendance records will appear
            here.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {records.map((record) => (
            <View
              key={record.id}
              style={styles.card}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.date}>
                    {formatDate(
                      record.attendanceDate
                    )}
                  </Text>

                  <Text style={styles.status}>
                    {statusText(record)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.dot,
                    record.autoPunchedOut &&
                      styles.autoDot,
                  ]}
                />
              </View>

              <View style={styles.times}>
                <View style={styles.timeColumn}>
                  <Text style={styles.label}>
                    Punch In
                  </Text>

                  <Text style={styles.time}>
                    {formatTime(record.punchIn)}
                  </Text>
                </View>

                <View style={styles.timeColumn}>
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

              {record.punchInStatus ===
                "OUT_OF_RANGE" &&
                record.punchInReason && (
                  <View style={styles.reason}>
                    <Text
                      style={styles.reasonLabel}
                    >
                      Punch In Reason
                    </Text>

                    <Text
                      style={styles.reasonText}
                    >
                      {record.punchInReason}
                    </Text>
                  </View>
                )}

              {record.punchOutStatus ===
                "OUT_OF_RANGE" &&
                record.punchOutReason && (
                  <View style={styles.reason}>
                    <Text
                      style={styles.reasonLabel}
                    >
                      Punch Out Reason
                    </Text>

                    <Text
                      style={styles.reasonText}
                    >
                      {record.punchOutReason}
                    </Text>
                  </View>
                )}

              {record.autoPunchedOut && (
                <View style={styles.notice}>
                  <Text style={styles.noticeText}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },

  header: {
    height: 64,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  back: {
    color: "#2563eb",
    fontSize: 15,
    fontWeight: "600",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  spacer: {
    width: 50,
  },

  container: {
    padding: 20,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },

  date: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },

  status: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#22c55e",
    marginTop: 4,
  },

  autoDot: {
    backgroundColor: "#f59e0b",
  },

  times: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
    paddingVertical: 15,
  },

  timeColumn: {
    flex: 1,
  },

  label: {
    fontSize: 11,
    color: "#9ca3af",
    marginBottom: 5,
  },

  time: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  reason: {
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f9fafb",
  },

  reasonLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6b7280",
    marginBottom: 4,
  },

  reasonText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#374151",
  },

  notice: {
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#fffbeb",
  },

  noticeText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#92400e",
  },

  muted: {
    fontSize: 13,
    lineHeight: 19,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
  },

  error: {
    fontSize: 14,
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 16,
  },

  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 9,
    backgroundColor: "#2563eb",
  },

  retryText: {
    color: "#ffffff",
    fontWeight: "700",
  },

  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
});