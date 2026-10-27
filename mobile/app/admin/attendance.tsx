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
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { useCallback, useState } from "react";

import {
  AdminAttendanceRecord,
  getEmployeeAttendance,
  getOutOfRangeAttendance,
  getTodayAttendance,
} from "../../src/api/admin";
import { useAdminAuth } from "../../src/context/AdminAuthContext";

type Filter = "TODAY" | "OUT_OF_RANGE";

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value?: string | null): string {
  if (!value) {
    return "--";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusText(
  record: AdminAttendanceRecord
): string {
  if (record.autoPunchedOut) {
    return "Auto Punched Out";
  }

  if (!record.punchOut) {
    return "Punched In";
  }

  return "Completed";
}

function AttendanceCard({
  record,
}: {
  record: AdminAttendanceRecord;
}) {
  return (
    <View style={styles.attendanceCard}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.employeeId}>
            {record.employeeId}
          </Text>

          <Text style={styles.date}>
            {formatDate(record.attendanceDate)}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            record.punchInStatus === "OUT_OF_RANGE"
              ? styles.outOfRangeBadge
              : styles.inRangeBadge,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              record.punchInStatus === "OUT_OF_RANGE"
                ? styles.outOfRangeText
                : styles.inRangeText,
            ]}
          >
            {getStatusText(record)}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.label}>Punch In</Text>
        <Text style={styles.value}>
          {formatTime(record.punchIn)}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Punch Out</Text>
        <Text style={styles.value}>
          {formatTime(record.punchOut)}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>
          Punch In Distance
        </Text>

        <Text style={styles.value}>
          {Number.isFinite(record.punchInDistance)
            ? `${record.punchInDistance.toFixed(1)} m`
            : "--"}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>
          Punch In Status
        </Text>

        <Text
          style={[
            styles.value,
            record.punchInStatus === "OUT_OF_RANGE"
              ? styles.warningValue
              : styles.successValue,
          ]}
        >
          {record.punchInStatus === "OUT_OF_RANGE"
            ? "Out of Range"
            : "In Range"}
        </Text>
      </View>

      {record.punchInReason ? (
        <View style={styles.reasonBox}>
          <Text style={styles.reasonTitle}>
            Outside Reason
          </Text>

          <Text style={styles.reasonText}>
            {record.punchInReason}
          </Text>
        </View>
      ) : null}

      {record.punchOutStatus ? (
        <View style={styles.row}>
          <Text style={styles.label}>
            Punch Out Status
          </Text>

          <Text
            style={[
              styles.value,
              record.punchOutStatus === "OUT_OF_RANGE"
                ? styles.warningValue
                : styles.successValue,
            ]}
          >
            {record.punchOutStatus === "OUT_OF_RANGE"
              ? "Out of Range"
              : "In Range"}
          </Text>
        </View>
      ) : null}

      {record.autoPunchedOut ? (
        <View style={styles.autoBox}>
          <Text style={styles.autoText}>
            This attendance was automatically punched out
            because the maximum session duration was reached.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export default function AdminAttendanceScreen() {
  const { token } = useAdminAuth();

  const params = useLocalSearchParams<{
    employeeId?: string;
  }>();

  const employeeId =
    typeof params.employeeId === "string"
      ? params.employeeId
      : undefined;

  const [filter, setFilter] =
    useState<Filter>("TODAY");

  const [records, setRecords] = useState<
    AdminAttendanceRecord[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadAttendance = useCallback(
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

        let response;

        if (employeeId) {
          response = await getEmployeeAttendance(
            token,
            employeeId
          );
        } else if (filter === "OUT_OF_RANGE") {
          response =
            await getOutOfRangeAttendance(token);
        } else {
          response = await getTodayAttendance(token);
        }

        setRecords(response.attendance || []);
      } catch (err: any) {
        setError(
          err?.message ||
            "Failed to load attendance records."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, employeeId, filter]
  );

  useFocusEffect(
    useCallback(() => {
      loadAttendance();
    }, [loadAttendance])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color="#2563eb"
          />

          <Text style={styles.loadingText}>
            Loading attendance...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>
              Attendance
            </Text>

            <Text style={styles.subtitle}>
              {employeeId
                ? `Attendance for ${employeeId}`
                : "Monitor employee attendance"}
            </Text>
          </View>

          <Pressable
            style={styles.backButton}
            onPress={() =>
              router.replace("/admin/dashboard")
            }
          >
            <Text style={styles.backButtonText}>
              Back
            </Text>
          </Pressable>
        </View>

        {!employeeId ? (
          <View style={styles.filterContainer}>
            <Pressable
              style={[
                styles.filterButton,
                filter === "TODAY" &&
                  styles.activeFilterButton,
              ]}
              onPress={() => setFilter("TODAY")}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === "TODAY" &&
                    styles.activeFilterText,
                ]}
              >
                Today
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.filterButton,
                filter === "OUT_OF_RANGE" &&
                  styles.activeFilterButton,
              ]}
              onPress={() =>
                setFilter("OUT_OF_RANGE")
              }
            >
              <Text
                style={[
                  styles.filterText,
                  filter === "OUT_OF_RANGE" &&
                    styles.activeFilterText,
                ]}
              >
                Out of Range
              </Text>
            </Pressable>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              {error}
            </Text>

            <Pressable
              style={styles.retryButton}
              onPress={() => loadAttendance()}
            >
              <Text style={styles.retryText}>
                Retry
              </Text>
            </Pressable>
          </View>
        ) : null}

        {records.length === 0 ? (
          <ScrollView
            contentContainerStyle={styles.emptyContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadAttendance(true)}
              />
            }
          >
            <Text style={styles.emptyTitle}>
              No attendance records
            </Text>

            <Text style={styles.emptyText}>
              {employeeId
                ? `No attendance history found for ${employeeId}.`
                : filter === "OUT_OF_RANGE"
                ? "No out-of-range attendance records found."
                : "No attendance has been marked today."}
            </Text>
          </ScrollView>
        ) : (
          <ScrollView
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadAttendance(true)}
              />
            }
          >
            <View style={styles.summary}>
              <Text style={styles.summaryLabel}>
                Records
              </Text>

              <Text style={styles.summaryValue}>
                {records.length}
              </Text>
            </View>

            {records.map((record) => (
              <AttendanceCard
                key={record.id}
                record={record}
              />
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
    backgroundColor: "#f8fafc",
  },

  container: {
    flex: 1,
    padding: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  headerText: {
    flex: 1,
    paddingRight: 12,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0f172a",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#64748b",
  },

  backButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
  },

  backButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },

  filterContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },

  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 9,
    backgroundColor: "#e2e8f0",
  },

  activeFilterButton: {
    backgroundColor: "#2563eb",
  },

  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },

  activeFilterText: {
    color: "#ffffff",
  },

  list: {
    paddingBottom: 30,
  },

  summary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    marginBottom: 12,
  },

  summaryLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },

  summaryValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
  },

  attendanceCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    marginBottom: 12,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  employeeId: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },

  date: {
    marginTop: 3,
    fontSize: 12,
    color: "#64748b",
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },

  inRangeBadge: {
    backgroundColor: "#dcfce7",
  },

  outOfRangeBadge: {
    backgroundColor: "#fee2e2",
  },

  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },

  inRangeText: {
    color: "#166534",
  },

  outOfRangeText: {
    color: "#991b1b",
  },

  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 14,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },

  label: {
    fontSize: 13,
    color: "#64748b",
  },

  value: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },

  successValue: {
    color: "#15803d",
  },

  warningValue: {
    color: "#b91c1c",
  },

  reasonBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 9,
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#fed7aa",
  },

  reasonTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9a3412",
    marginBottom: 4,
  },

  reasonText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#7c2d12",
  },

  autoBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#eff6ff",
  },

  autoText: {
    fontSize: 12,
    lineHeight: 17,
    color: "#1e40af",
  },

  errorBox: {
    marginBottom: 16,
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
    padding: 20,
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#64748b",
  },

  emptyContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },

  emptyText: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748b",
    textAlign: "center",
  },
});