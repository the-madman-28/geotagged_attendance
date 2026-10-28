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

import AppBackground from "../../src/components/AppBackground";
import AppHeader from "../../src/components/AppHeader";
import AppCard from "../../src/components/AppCard";
import AppFooter from "../../src/components/AppFooter";

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
    return "Punch In · Outside Workplace";
  }

  if (record.punchOutStatus === "OUT_OF_RANGE") {
    return "Punch Out · Outside Workplace";
  }

  return "Completed";
}

export default function HistoryScreen() {
  const { token } = useAuth();

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const result = await getAttendanceHistory(token);
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
    <AppBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerArea}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>‹</Text>
            <Text style={styles.backText}>Back</Text>
          </Pressable>

          <AppHeader
            title="Attendance History"
            subtitle="Review your previous attendance"
          />
        </View>

        {loading ? (
          <View style={styles.center}>
            <View style={styles.loadingIcon}>
              <ActivityIndicator color="#1677B8" size="small" />
            </View>

            <Text style={styles.centerTitle}>
              Loading history
            </Text>

            <Text style={styles.muted}>
              Please wait while we fetch your attendance records.
            </Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <View style={styles.errorIcon}>
              <Text style={styles.errorIconText}>!</Text>
            </View>

            <Text style={styles.centerTitle}>
              Unable to load history
            </Text>

            <Text style={styles.error}>
              {error}
            </Text>

            <Pressable
              onPress={loadHistory}
              style={({ pressed }) => [
                styles.retryButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.retryText}>
                Try Again
              </Text>
            </Pressable>
          </View>
        ) : records.length === 0 ? (
          <View style={styles.center}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>◷</Text>
            </View>

            <Text style={styles.centerTitle}>
              No Attendance Yet
            </Text>

            <Text style={styles.muted}>
              Your attendance records will appear here
              after you punch in.
            </Text>

            <Pressable
              onPress={() =>
                router.push("/employee/punch_in")
              }
              style={({ pressed }) => [
                styles.emptyAction,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.emptyActionText}>
                Punch In
              </Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.summaryCard}>
              <View style={styles.summaryIcon}>
                <Text style={styles.summaryIconText}>✓</Text>
              </View>

              <View style={styles.summaryText}>
                <Text style={styles.summaryLabel}>
                  ATTENDANCE RECORDS
                </Text>

                <Text style={styles.summaryTitle}>
                  Your attendance activity
                </Text>
              </View>

              <View style={styles.countBadge}>
                <Text style={styles.countText}>
                  {records.length}
                </Text>
              </View>
            </View>

            {records.map((record) => {
              const outsideRange =
                record.punchInStatus === "OUT_OF_RANGE" ||
                record.punchOutStatus === "OUT_OF_RANGE";

              const statusColor = record.autoPunchedOut
                ? "#F59E0B"
                : outsideRange
                  ? "#E3A21A"
                  : "#22A866";

              return (
                <AppCard
                  key={record.id}
                  style={styles.card}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.dateSection}>
                      <Text style={styles.date}>
                        {formatDate(record.attendanceDate)}
                      </Text>

                      <View style={styles.statusRow}>
                        <View
                          style={[
                            styles.statusDot,
                            {
                              backgroundColor: statusColor,
                            },
                          ]}
                        />

                        <Text style={styles.status}>
                          {statusText(record)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.calendarBadge}>
                      <Text style={styles.calendarText}>
                        {new Date(
                          record.attendanceDate
                        ).getDate()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.times}>
                    <View style={styles.timeColumn}>
                      <Text style={styles.label}>
                        PUNCH IN
                      </Text>

                      <Text style={styles.time}>
                        {formatTime(record.punchIn)}
                      </Text>
                    </View>

                    <View style={styles.timeDivider} />

                    <View style={styles.timeColumn}>
                      <Text style={styles.label}>
                        PUNCH OUT
                      </Text>

                      <Text style={styles.time}>
                        {formatTime(record.punchOut)}
                      </Text>
                    </View>
                  </View>

                  {record.punchInStatus === "OUT_OF_RANGE" &&
                    record.punchInReason && (
                      <View style={styles.reason}>
                        <View style={styles.reasonHeader}>
                          <View
                            style={[
                              styles.reasonDot,
                              {
                                backgroundColor: "#E3A21A",
                              },
                            ]}
                          />

                          <Text style={styles.reasonLabel}>
                            PUNCH IN REASON
                          </Text>
                        </View>

                        <Text style={styles.reasonText}>
                          {record.punchInReason}
                        </Text>
                      </View>
                    )}

                  {record.punchOutStatus === "OUT_OF_RANGE" &&
                    record.punchOutReason && (
                      <View style={styles.reason}>
                        <View style={styles.reasonHeader}>
                          <View
                            style={[
                              styles.reasonDot,
                              {
                                backgroundColor: "#E3A21A",
                              },
                            ]}
                          />

                          <Text style={styles.reasonLabel}>
                            PUNCH OUT REASON
                          </Text>
                        </View>

                        <Text style={styles.reasonText}>
                          {record.punchOutReason}
                        </Text>
                      </View>
                    )}

                  {record.autoPunchedOut && (
                    <View style={styles.notice}>
                      <View style={styles.noticeIcon}>
                        <Text style={styles.noticeIconText}>
                          !
                        </Text>
                      </View>

                      <View style={styles.noticeContent}>
                        <Text style={styles.noticeTitle}>
                          Automatic punch-out
                        </Text>

                        <Text style={styles.noticeText}>
                          This session was automatically
                          closed after the maximum session
                          duration.
                        </Text>
                      </View>
                    </View>
                  )}
                </AppCard>
              );
            })}

            <AppFooter />
          </ScrollView>
        )}
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  headerArea: {
    paddingBottom: 2,
  },

  backButton: {
    marginHorizontal: 20,
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
  },

  backIcon: {
    fontSize: 30,
    lineHeight: 30,
    color: "#1677B8",
    marginRight: 5,
  },

  backText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1677B8",
  },

  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  summaryCard: {
    minHeight: 76,
    marginBottom: 14,
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#0B4F8A",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
  },

  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#EAF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  summaryIconText: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1677B8",
  },

  summaryText: {
    flex: 1,
  },

  summaryLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: "#8A99AB",
  },

  summaryTitle: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: "700",
    color: "#102A56",
  },

  countBadge: {
    minWidth: 38,
    height: 38,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: "#1677B8",
    alignItems: "center",
    justifyContent: "center",
  },

  countText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  card: {
    marginBottom: 12,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },

  dateSection: {
    flex: 1,
    paddingRight: 10,
  },

  date: {
    fontSize: 17,
    fontWeight: "800",
    color: "#102A56",
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 7,
  },

  status: {
    fontSize: 11,
    color: "#718096",
  },

  calendarBadge: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#F3F8FC",
    alignItems: "center",
    justifyContent: "center",
  },

  calendarText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1677B8",
  },

  times: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#EDF2F7",
    paddingVertical: 14,
  },

  timeColumn: {
    flex: 1,
  },

  timeDivider: {
    width: 1,
    backgroundColor: "#EDF2F7",
    marginHorizontal: 16,
  },

  label: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.7,
    color: "#9AA8B8",
    marginBottom: 5,
  },

  time: {
    fontSize: 16,
    fontWeight: "800",
    color: "#102A56",
  },

  reason: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#F6F9FC",
  },

  reasonHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },

  reasonDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 7,
  },

  reasonLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.7,
    color: "#8A99AB",
  },

  reasonText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#42566B",
  },

  notice: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FFF8EA",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  noticeIcon: {
    width: 25,
    height: 25,
    borderRadius: 8,
    backgroundColor: "#FFE8B2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  noticeIconText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#9A6700",
  },

  noticeContent: {
    flex: 1,
  },

  noticeTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#9A6700",
  },

  noticeText: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 17,
    color: "#856404",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  loadingIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: "#EAF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },

  centerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#102A56",
    textAlign: "center",
  },

  muted: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: "#718096",
    textAlign: "center",
  },

  errorIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: "#FFF0F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },

  errorIconText: {
    fontSize: 23,
    fontWeight: "800",
    color: "#D94A4A",
  },

  error: {
    fontSize: 13,
    lineHeight: 19,
    color: "#718096",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 16,
  },

  retryButton: {
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 11,
    backgroundColor: "#1677B8",
  },

  retryText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF6FF",
    marginBottom: 13,
  },

  emptyIconText: {
    fontSize: 28,
    color: "#1677B8",
    fontWeight: "700",
  },

  emptyAction: {
    marginTop: 18,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 11,
    backgroundColor: "#1677B8",
  },

  emptyActionText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});