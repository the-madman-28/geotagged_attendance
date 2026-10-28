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

function getStatusText(record: AdminAttendanceRecord): string {
  if (record.autoPunchedOut) {
    return "Auto Punched Out";
  }

  if (!record.punchOut) {
    return "Punched In";
  }

  return "Completed";
}

function getStatusStyle(record: AdminAttendanceRecord) {
  if (record.autoPunchedOut) {
    return {
      badge: styles.autoBadge,
      text: styles.autoBadgeText,
    };
  }

  if (record.punchInStatus === "OUT_OF_RANGE") {
    return {
      badge: styles.outOfRangeBadge,
      text: styles.outOfRangeBadgeText,
    };
  }

  if (!record.punchOut) {
    return {
      badge: styles.punchedInBadge,
      text: styles.punchedInBadgeText,
    };
  }

  return {
    badge: styles.completedBadge,
    text: styles.completedBadgeText,
  };
}

function AttendanceCard({
  record,
}: {
  record: AdminAttendanceRecord;
}) {
  const statusStyle = getStatusStyle(record);

  return (
    <View style={styles.attendanceCard}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.employeeSection}>
          <View style={styles.employeeIcon}>
            <Text style={styles.employeeIconText}>
              {record.employeeId.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.employeeInfo}>
            <Text style={styles.employeeId}>
              {record.employeeId}
            </Text>

            <Text style={styles.date}>
              {formatDate(record.attendanceDate)}
            </Text>
          </View>
        </View>

        <View style={[styles.statusBadge, statusStyle.badge]}>
          <Text style={[styles.statusText, statusStyle.text]}>
            {getStatusText(record)}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Punch Summary */}
      <View style={styles.timeGrid}>
        <View style={styles.timeItem}>
          <Text style={styles.timeLabel}>Punch In</Text>

          <Text style={styles.timeValue}>
            {formatTime(record.punchIn)}
          </Text>
        </View>

        <View style={styles.timeItem}>
          <Text style={styles.timeLabel}>Punch Out</Text>

          <Text style={styles.timeValue}>
            {formatTime(record.punchOut)}
          </Text>
        </View>
      </View>

      {/* Attendance Details */}
      <View style={styles.detailsBox}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>
            Punch In Distance
          </Text>

          <Text style={styles.detailValue}>
            {Number.isFinite(record.punchInDistance)
              ? `${record.punchInDistance.toFixed(1)} m`
              : "--"}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>
            Punch In Status
          </Text>

          <Text
            style={[
              styles.detailValue,
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

        {record.punchOutStatus ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Punch Out Status
            </Text>

            <Text
              style={[
                styles.detailValue,
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
      </View>

      {/* Outside Reason */}
      {record.punchInReason ? (
        <View style={styles.reasonBox}>
          <View style={styles.reasonHeader}>
            <View style={styles.reasonIndicator} />

            <Text style={styles.reasonTitle}>
              Outside Reason
            </Text>
          </View>

          <Text style={styles.reasonText}>
            {record.punchInReason}
          </Text>
        </View>
      ) : null}

      {/* Auto Punch Out */}
      {record.autoPunchedOut ? (
        <View style={styles.autoBox}>
          <View style={styles.autoIcon}>
            <Text style={styles.autoIconText}>!</Text>
          </View>

          <View style={styles.autoContent}>
            <Text style={styles.autoTitle}>
              Automatic Punch Out
            </Text>

            <Text style={styles.autoText}>
              This attendance was automatically punched out
              because the maximum session duration was reached.
            </Text>
          </View>
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
        <View style={styles.loadingScreen}>
          <View style={styles.loadingIcon}>
            <ActivityIndicator
              size="large"
              color="#2563EB"
            />
          </View>

          <Text style={styles.loadingTitle}>
            Loading attendance
          </Text>

          <Text style={styles.loadingSubtitle}>
            Fetching the latest attendance records...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.pageIcon}>
              <Text style={styles.pageIconText}>✓</Text>
            </View>

            <View style={styles.headerText}>
              <Text style={styles.eyebrow}>
                ADMIN PORTAL
              </Text>

              <Text style={styles.title}>
                Attendance
              </Text>

              <Text style={styles.subtitle}>
                {employeeId
                  ? `Attendance history for ${employeeId}`
                  : "Monitor employee attendance activity"}
              </Text>
            </View>
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

        {/* Filter Bar */}
        {!employeeId ? (
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>
              ATTENDANCE VIEW
            </Text>

            <View style={styles.filterContainer}>
              <Pressable
                style={[
                  styles.filterButton,
                  filter === "TODAY" &&
                    styles.activeFilterButton,
                ]}
                onPress={() => setFilter("TODAY")}
              >
                <View
                  style={[
                    styles.filterDot,
                    filter === "TODAY" &&
                      styles.activeFilterDot,
                  ]}
                />

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
                <View
                  style={[
                    styles.filterDot,
                    filter === "OUT_OF_RANGE" &&
                      styles.activeWarningDot,
                  ]}
                />

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
          </View>
        ) : (
          <View style={styles.employeeViewBanner}>
            <View style={styles.employeeViewIcon}>
              <Text style={styles.employeeViewIconText}>
                E
              </Text>
            </View>

            <View style={styles.employeeViewContent}>
              <Text style={styles.employeeViewLabel}>
                EMPLOYEE ATTENDANCE
              </Text>

              <Text style={styles.employeeViewId}>
                {employeeId}
              </Text>
            </View>
          </View>
        )}

        {/* Error */}
        {error ? (
          <View style={styles.errorBox}>
            <View style={styles.errorIcon}>
              <Text style={styles.errorIconText}>!</Text>
            </View>

            <View style={styles.errorContent}>
              <Text style={styles.errorTitle}>
                Unable to load attendance
              </Text>

              <Text style={styles.errorText}>
                {error}
              </Text>

              <Pressable
                style={styles.retryButton}
                onPress={() => loadAttendance()}
              >
                <Text style={styles.retryText}>
                  Try Again
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {/* Empty State */}
        {records.length === 0 ? (
          <ScrollView
            contentContainerStyle={styles.emptyContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadAttendance(true)}
                tintColor="#2563EB"
              />
            }
          >
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Text style={styles.emptyIconText}>
                  ✓
                </Text>
              </View>

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

              <Text style={styles.pullText}>
                Pull down to refresh
              </Text>
            </View>
          </ScrollView>
        ) : (
          <ScrollView
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadAttendance(true)}
                tintColor="#2563EB"
              />
            }
          >
            {/* Summary */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryLeft}>
                <View style={styles.summaryIcon}>
                  <Text style={styles.summaryIconText}>
                    #
                  </Text>
                </View>

                <View>
                  <Text style={styles.summaryLabel}>
                    TOTAL RECORDS
                  </Text>

                  <Text style={styles.summaryCaption}>
                    {employeeId
                      ? "Employee attendance history"
                      : filter === "OUT_OF_RANGE"
                      ? "Out-of-range activity"
                      : "Attendance marked today"}
                  </Text>
                </View>
              </View>

              <Text style={styles.summaryValue}>
                {records.length}
              </Text>
            </View>

            {/* Records */}
            {records.map((record) => (
              <AttendanceCard
                key={record.id}
                record={record}
              />
            ))}

            <View style={styles.bottomSpace} />
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7FAFC",
  },

  container: {
    flex: 1,
    backgroundColor: "#F7FAFC",
    paddingHorizontal: 20,
  },

  /* ================= HEADER ================= */

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    paddingBottom: 20,
  },

  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 12,
  },

  pageIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  pageIconText: {
    fontSize: 21,
    fontWeight: "800",
    color: "#2563EB",
  },

  headerText: {
    flex: 1,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
    color: "#2563EB",
    marginBottom: 2,
  },

  title: {
    fontSize: 25,
    lineHeight: 30,
    fontWeight: "800",
    color: "#102A56",
  },

  subtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#718096",
  },

  backButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE5F0",
  },

  backButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },

  /* ================= FILTER ================= */

  filterSection: {
    marginBottom: 16,
  },

  filterLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.9,
    color: "#8A99AD",
    marginBottom: 8,
  },

  filterContainer: {
    flexDirection: "row",
    gap: 10,
  },

  filterButton: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E7F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  activeFilterButton: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  filterDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#94A3B8",
    marginRight: 7,
  },

  activeFilterDot: {
    backgroundColor: "#FFFFFF",
  },

  activeWarningDot: {
    backgroundColor: "#FDE68A",
  },

  filterText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
  },

  activeFilterText: {
    color: "#FFFFFF",
  },

  /* ================= EMPLOYEE VIEW ================= */

  employeeViewBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DCE5F0",
    padding: 14,
    marginBottom: 16,
  },

  employeeViewIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  employeeViewIconText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#2563EB",
  },

  employeeViewContent: {
    flex: 1,
  },

  employeeViewLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.9,
    color: "#8A99AD",
  },

  employeeViewId: {
    marginTop: 2,
    fontSize: 17,
    fontWeight: "800",
    color: "#102A56",
  },

  /* ================= SUMMARY ================= */

  summaryCard: {
    minHeight: 76,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E8F0",
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  summaryLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  summaryIconText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2563EB",
  },

  summaryLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: "#7C8CA2",
  },

  summaryCaption: {
    marginTop: 3,
    fontSize: 11,
    color: "#94A3B8",
  },

  summaryValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#102A56",
    marginLeft: 10,
  },

  /* ================= ATTENDANCE CARD ================= */

  attendanceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E1E8F0",
    padding: 16,
    marginBottom: 12,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  employeeSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 8,
  },

  employeeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  employeeIconText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#2563EB",
  },

  employeeInfo: {
    flex: 1,
  },

  employeeId: {
    fontSize: 16,
    fontWeight: "800",
    color: "#102A56",
  },

  date: {
    marginTop: 3,
    fontSize: 11,
    color: "#8795A8",
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
    maxWidth: 125,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "800",
    textAlign: "center",
  },

  completedBadge: {
    backgroundColor: "#DCFCE7",
  },

  completedBadgeText: {
    color: "#166534",
  },

  punchedInBadge: {
    backgroundColor: "#DBEAFE",
  },

  punchedInBadgeText: {
    color: "#1D4ED8",
  },

  outOfRangeBadge: {
    backgroundColor: "#FEE2E2",
  },

  outOfRangeBadgeText: {
    color: "#B91C1C",
  },

  autoBadge: {
    backgroundColor: "#FEF3C7",
  },

  autoBadgeText: {
    color: "#92400E",
  },

  divider: {
    height: 1,
    backgroundColor: "#EDF1F5",
    marginVertical: 14,
  },

  /* ================= TIME ================= */

  timeGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },

  timeItem: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
  },

  timeLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#8A99AD",
    marginBottom: 4,
  },

  timeValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E293B",
  },

  /* ================= DETAILS ================= */

  detailsBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  detailRow: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  detailLabel: {
    fontSize: 12,
    color: "#718096",
  },

  detailValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },

  successValue: {
    color: "#15803D",
  },

  warningValue: {
    color: "#B91C1C",
  },

  /* ================= REASON ================= */

  reasonBox: {
    marginTop: 11,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
  },

  reasonHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },

  reasonIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EA580C",
    marginRight: 7,
  },

  reasonTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#9A3412",
  },

  reasonText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#7C2D12",
  },

  /* ================= AUTO PUNCH ================= */

  autoBox: {
    marginTop: 11,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  autoIcon: {
    width: 25,
    height: 25,
    borderRadius: 8,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  autoIconText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#2563EB",
  },

  autoContent: {
    flex: 1,
  },

  autoTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1E40AF",
    marginBottom: 3,
  },

  autoText: {
    fontSize: 11,
    lineHeight: 17,
    color: "#3B82F6",
  },

  /* ================= ERROR ================= */

  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 13,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 14,
  },

  errorIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  errorIconText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#DC2626",
  },

  errorContent: {
    flex: 1,
  },

  errorTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#991B1B",
    marginBottom: 3,
  },

  errorText: {
    fontSize: 12,
    lineHeight: 17,
    color: "#B91C1C",
  },

  retryButton: {
    alignSelf: "flex-start",
    marginTop: 9,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: "#FEE2E2",
  },

  retryText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#991B1B",
  },

  /* ================= EMPTY ================= */

  emptyContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },

  emptyCard: {
    width: "100%",
    maxWidth: 390,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E1E8F0",
    paddingHorizontal: 25,
    paddingVertical: 32,
  },

  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  emptyIconText: {
    fontSize: 25,
    fontWeight: "800",
    color: "#2563EB",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#102A56",
    textAlign: "center",
  },

  emptyText: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 19,
    color: "#718096",
    textAlign: "center",
  },

  pullText: {
    marginTop: 15,
    fontSize: 10,
    fontWeight: "600",
    color: "#A0AEC0",
  },

  /* ================= LOADING ================= */

  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    backgroundColor: "#F7FAFC",
  },

  loadingIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  loadingTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#102A56",
  },

  loadingSubtitle: {
    marginTop: 5,
    fontSize: 12,
    color: "#8795A8",
    textAlign: "center",
  },

  list: {
    paddingBottom: 30,
  },

  bottomSpace: {
    height: 10,
  },
});