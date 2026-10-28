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
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../src/context/AuthContext";
import {
  AttendanceRecord,
  getTodayAttendance,
} from "../../src/api/attendance";

import AppBackground from "../../src/components/AppBackground";
import AppHeader from "../../src/components/AppHeader";
import AppCard from "../../src/components/AppCard";
import AppFooter from "../../src/components/AppFooter";

type AttendanceState =
  | "NOT_MARKED"
  | "PUNCHED_IN"
  | "COMPLETED"
  | "AUTO_PUNCHED_OUT";

function getAttendanceState(
  attendance: AttendanceRecord | null
): AttendanceState {
  if (!attendance) {
    return "NOT_MARKED";
  }

  if (attendance.autoPunchedOut) {
    return "AUTO_PUNCHED_OUT";
  }

  if (!attendance.punchOut) {
    return "PUNCHED_IN";
  }

  return "COMPLETED";
}

function getAttendanceStateLabel(
  attendance: AttendanceRecord | null
) {
  const state = getAttendanceState(attendance);

  switch (state) {
    case "PUNCHED_IN":
      return "Punched In";

    case "COMPLETED":
      return "Completed";

    case "AUTO_PUNCHED_OUT":
      return "Auto Punched Out";

    default:
      return "Not Marked";
  }
}

function formatTime(value?: string | null) {
  if (!value) {
    return "--";
  }

  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EmployeeDashboard() {
  const {
    token,
    employee,
    loading: authLoading,
    logout,
  } = useAuth();

  const [attendance, setAttendance] =
    useState<AttendanceRecord | null>(null);

  const [loading, setLoading] = useState(true);

  const loadAttendance = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const result = await getTodayAttendance(token);

      setAttendance(result.attendance);
    } catch (error) {
      console.error(
        "Failed to load today's attendance:",
        error
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

  function handleAttendanceAction() {
    if (!attendance) {
      router.push("/employee/punch_in");
      return;
    }

    const state = getAttendanceState(attendance);

    if (state === "NOT_MARKED") {
      router.push("/employee/punch_in");
    } else if (state === "PUNCHED_IN") {
      router.push("/employee/punch_out");
    } else {
      Alert.alert(
        "Attendance Completed",
        "Today's attendance has already been completed."
      );
    }
  }

  if (authLoading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingLogo}>
            <Text style={styles.loadingLogoText}>
              GA
            </Text>
          </View>

          <ActivityIndicator
            size="small"
            color="#1677B8"
          />

          <Text style={styles.loadingText}>
            Loading your dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!token || !employee) {
    return null;
  }

  const state = getAttendanceState(attendance);

  const stateLabel = getAttendanceStateLabel(
    attendance
  );

  const actionLabel =
    state === "PUNCHED_IN"
      ? "Punch Out"
      : state === "NOT_MARKED"
        ? "Punch In"
        : "Attendance Completed";

  const stateStyle =
    state === "PUNCHED_IN"
      ? styles.statusActive
      : state === "COMPLETED"
        ? styles.statusCompleted
        : state === "AUTO_PUNCHED_OUT"
          ? styles.statusAuto
          : styles.statusPending;

  const statusDotStyle =
    state === "PUNCHED_IN"
      ? styles.statusDotActive
      : state === "COMPLETED"
        ? styles.statusDotCompleted
        : state === "AUTO_PUNCHED_OUT"
          ? styles.statusDotAuto
          : styles.statusDotPending;

  const isAttendanceClosed =
    state === "COMPLETED" ||
    state === "AUTO_PUNCHED_OUT";

  return (
    <AppBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <AppHeader
            title="Employee Dashboard"
            subtitle={`Welcome back, ${employee.name}`}
          />

          {/* Welcome section */}
          <View style={styles.greeting}>
            <View style={styles.greetingText}>
              <Text style={styles.eyebrow}>
                TODAY'S ATTENDANCE
              </Text>

              <Text style={styles.heading}>
                Good to see you
              </Text>

              <Text style={styles.employeeId}>
                Employee ID · {employee.employeeId}
              </Text>
            </View>

            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {employee.name
                  ?.charAt(0)
                  .toUpperCase() || "E"}
              </Text>
            </View>
          </View>

          {/* Attendance status */}
          <AppCard style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View style={styles.statusHeading}>
                <Text style={styles.cardLabel}>
                  ATTENDANCE STATUS
                </Text>

                <Text style={styles.statusTitle}>
                  {stateLabel}
                </Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  stateStyle,
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    statusDotStyle,
                  ]}
                />

                <Text style={styles.statusBadgeText}>
                  {state === "PUNCHED_IN"
                    ? "Active"
                    : state === "NOT_MARKED"
                      ? "Pending"
                      : "Closed"}
                </Text>
              </View>
            </View>

            {/* Time information */}
            <View style={styles.timeGrid}>
              <View style={styles.timeBox}>
                <Text style={styles.timeLabel}>
                  PUNCH IN
                </Text>

                <Text style={styles.timeValue}>
                  {formatTime(attendance?.punchIn)}
                </Text>

                {attendance?.punchInStatus ===
                  "OUT_OF_RANGE" && (
                  <Text style={styles.outsideText}>
                    Outside workplace
                  </Text>
                )}
              </View>

              <View style={styles.timeDivider} />

              <View style={styles.timeBox}>
                <Text style={styles.timeLabel}>
                  PUNCH OUT
                </Text>

                <Text style={styles.timeValue}>
                  {formatTime(attendance?.punchOut)}
                </Text>

                {attendance?.punchOutStatus ===
                  "OUT_OF_RANGE" && (
                  <Text style={styles.outsideText}>
                    Outside workplace
                  </Text>
                )}
              </View>
            </View>

            {/* Automatic punch-out notice */}
            {attendance?.autoPunchedOut && (
              <View style={styles.autoNotice}>
                <View style={styles.autoNoticeIcon}>
                  <Text style={styles.autoNoticeIconText}>
                    !
                  </Text>
                </View>

                <View style={styles.autoNoticeContent}>
                  <Text style={styles.autoNoticeTitle}>
                    Automatic punch-out
                  </Text>

                  <Text style={styles.autoNoticeText}>
                    Your session was automatically closed
                    after the maximum session duration.
                  </Text>
                </View>
              </View>
            )}

            {/* Outside reason information */}
            {attendance?.punchInReason && (
              <View style={styles.reasonBox}>
                <Text style={styles.reasonLabel}>
                  PUNCH-IN NOTE
                </Text>

                <Text style={styles.reasonText}>
                  {attendance.punchInReason}
                </Text>
              </View>
            )}

            {attendance?.punchOutReason && (
              <View style={styles.reasonBox}>
                <Text style={styles.reasonLabel}>
                  PUNCH-OUT NOTE
                </Text>

                <Text style={styles.reasonText}>
                  {attendance.punchOutReason}
                </Text>
              </View>
            )}
          </AppCard>

          {/* Main attendance action */}
          <Pressable
            onPress={handleAttendanceAction}
            disabled={loading || isAttendanceClosed}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed &&
                !loading &&
                !isAttendanceClosed &&
                styles.buttonPressed,
              (loading || isAttendanceClosed) &&
                styles.disabledButton,
            ]}
          >
            {loading ? (
              <View style={styles.buttonLoading}>
                <ActivityIndicator color="#FFFFFF" />

                <Text style={styles.buttonLoadingText}>
                  Loading...
                </Text>
              </View>
            ) : (
              <>
                <View
                  style={[
                    styles.primaryButtonIcon,
                    state === "PUNCHED_IN" &&
                      styles.punchOutIcon,
                  ]}
                >
                  <Text style={styles.primaryButtonIconText}>
                    {state === "PUNCHED_IN"
                      ? "↗"
                      : state === "NOT_MARKED"
                        ? "✓"
                        : "✓"}
                  </Text>
                </View>

                <Text style={styles.primaryButtonText}>
                  {actionLabel}
                </Text>

                {state === "PUNCHED_IN" && (
                  <Text style={styles.primaryButtonArrow}>
                    →
                  </Text>
                )}
              </>
            )}
          </Pressable>

          {/* Quick actions */}
          <Text style={styles.sectionLabel}>
            QUICK ACCESS
          </Text>

          <View style={styles.actionGrid}>
            <Pressable
              onPress={() =>
                router.push("/employee/history")
              }
              style={({ pressed }) => [
                styles.actionCard,
                pressed && styles.cardPressed,
              ]}
            >
              <View style={styles.actionIcon}>
                <Text style={styles.actionIconText}>
                  ◷
                </Text>
              </View>

              <Text style={styles.actionTitle}>
                Attendance History
              </Text>

              <Text style={styles.actionDescription}>
                View your previous attendance records
              </Text>

              <Text style={styles.arrow}>
                ›
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                router.push("/employee/profile")
              }
              style={({ pressed }) => [
                styles.actionCard,
                pressed && styles.cardPressed,
              ]}
            >
              <View
                style={[
                  styles.actionIcon,
                  styles.profileIcon,
                ]}
              >
                <Text style={styles.actionIconText}>
                  ●
                </Text>
              </View>

              <Text style={styles.actionTitle}>
                My Profile
              </Text>

              <Text style={styles.actionDescription}>
                View your employee information
              </Text>

              <Text style={styles.arrow}>
                ›
              </Text>
            </Pressable>
          </View>

          {/* Attendance state explanation */}
          {state === "NOT_MARKED" && (
            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <Text style={styles.infoIconText}>
                  i
                </Text>
              </View>

              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>
                  Ready to start?
                </Text>

                <Text style={styles.infoText}>
                  Make sure your location is enabled before
                  punching in.
                </Text>
              </View>
            </View>
          )}

          {state === "PUNCHED_IN" && (
            <View
              style={[
                styles.infoCard,
                styles.activeInfoCard,
              ]}
            >
              <View
                style={[
                  styles.infoIcon,
                  styles.activeInfoIcon,
                ]}
              >
                <Text style={styles.infoIconText}>
                  ✓
                </Text>
              </View>

              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>
                  Attendance is active
                </Text>

                <Text style={styles.infoText}>
                  Your work session is currently running.
                  Punch out when you finish.
                </Text>
              </View>
            </View>
          )}

          {state === "COMPLETED" && (
            <View
              style={[
                styles.infoCard,
                styles.completedInfoCard,
              ]}
            >
              <View
                style={[
                  styles.infoIcon,
                  styles.completedInfoIcon,
                ]}
              >
                <Text style={styles.infoIconText}>
                  ✓
                </Text>
              </View>

              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>
                  Attendance completed
                </Text>

                <Text style={styles.infoText}>
                  Your attendance for today has been
                  successfully recorded.
                </Text>
              </View>
            </View>
          )}

          {state === "AUTO_PUNCHED_OUT" && (
            <View
              style={[
                styles.infoCard,
                styles.autoInfoCard,
              ]}
            >
              <View
                style={[
                  styles.infoIcon,
                  styles.autoInfoIcon,
                ]}
              >
                <Text style={styles.infoIconText}>
                  !
                </Text>
              </View>

              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>
                  Session automatically closed
                </Text>

                <Text style={styles.infoText}>
                  Your attendance was automatically punched
                  out after reaching the allowed session
                  duration.
                </Text>
              </View>
            </View>
          )}

          {/* Logout */}
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.cardPressed,
            ]}
          >
            <Text style={styles.logoutIcon}>
              ↪
            </Text>

            <Text style={styles.logoutText}>
              Logout
            </Text>
          </Pressable>

          <AppFooter />
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FBFF",
  },

  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },

  loadingLogo: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#EAF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  loadingLogoText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1677B8",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 12,
    color: "#7B8CA3",
    fontWeight: "600",
  },

  safeArea: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 20,
  },

  greeting: {
    paddingHorizontal: 20,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  greetingText: {
    flex: 1,
    paddingRight: 12,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#1687C9",
    marginBottom: 5,
  },

  heading: {
    fontSize: 25,
    fontWeight: "800",
    color: "#102A56",
  },

  employeeId: {
    marginTop: 5,
    fontSize: 12,
    color: "#718096",
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1677B8",
    shadowColor: "#1677B8",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 9,
    elevation: 4,
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "800",
  },

  statusCard: {
    marginHorizontal: 20,
    marginBottom: 16,
  },

  statusHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  statusHeading: {
    flex: 1,
    paddingRight: 10,
  },

  cardLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#8A99AB",
  },

  statusTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#102A56",
    marginTop: 5,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusActive: {
    backgroundColor: "#E8F8F0",
  },

  statusCompleted: {
    backgroundColor: "#EAF4FF",
  },

  statusAuto: {
    backgroundColor: "#FFF6E5",
  },

  statusPending: {
    backgroundColor: "#F1F5F9",
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  statusDotActive: {
    backgroundColor: "#22A866",
  },

  statusDotCompleted: {
    backgroundColor: "#1677B8",
  },

  statusDotAuto: {
    backgroundColor: "#F59E0B",
  },

  statusDotPending: {
    backgroundColor: "#94A3B8",
  },

  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#476072",
  },

  timeGrid: {
    flexDirection: "row",
    marginTop: 22,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: "#EDF2F7",
  },

  timeBox: {
    flex: 1,
  },

  timeDivider: {
    width: 1,
    backgroundColor: "#EDF2F7",
    marginHorizontal: 18,
  },

  timeLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9AA8B8",
    letterSpacing: 0.6,
  },

  timeValue: {
    marginTop: 5,
    fontSize: 19,
    fontWeight: "800",
    color: "#102A56",
  },

  outsideText: {
    marginTop: 4,
    fontSize: 9,
    fontWeight: "700",
    color: "#D94A4A",
  },

  autoNotice: {
    flexDirection: "row",
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FFF8EA",
  },

  autoNoticeIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: "#FFE9B8",
    alignItems: "center",
    justifyContent: "center",
  },

  autoNoticeIconText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#9A6700",
  },

  autoNoticeContent: {
    flex: 1,
    marginLeft: 9,
  },

  autoNoticeTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#9A6700",
  },

  autoNoticeText: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 17,
    color: "#856404",
  },

  reasonBox: {
    marginTop: 12,
    padding: 11,
    borderRadius: 11,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#EDF2F7",
  },

  reasonLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.7,
    color: "#8A99AB",
  },

  reasonText: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 16,
    color: "#52647D",
  },

  primaryButton: {
    height: 58,
    marginHorizontal: 20,
    borderRadius: 16,
    backgroundColor: "#1677B8",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",

    shadowColor: "#1677B8",
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,

    elevation: 5,
  },

  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },

  disabledButton: {
    opacity: 0.55,
  },

  primaryButtonIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  punchOutIcon: {
    backgroundColor: "rgba(255,255,255,0.18)",
  },

  primaryButtonIconText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  primaryButtonArrow: {
    position: "absolute",
    right: 18,
    color: "#FFFFFF",
    fontSize: 21,
  },

  buttonLoading: {
    flexDirection: "row",
    alignItems: "center",
  },

  buttonLoadingText: {
    marginLeft: 9,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  sectionLabel: {
    marginHorizontal: 20,
    marginTop: 22,
    marginBottom: 10,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#8A99AB",
  },

  actionGrid: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 20,
  },

  actionCard: {
    flex: 1,
    minHeight: 145,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 15,

    shadowColor: "#0B4F8A",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.05,
    shadowRadius: 14,

    elevation: 3,
  },

  cardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },

  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF6FF",
    marginBottom: 12,
  },

  profileIcon: {
    backgroundColor: "#EEF9F4",
  },

  actionIconText: {
    color: "#1677B8",
    fontSize: 17,
    fontWeight: "800",
  },

  actionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#102A56",
  },

  actionDescription: {
    marginTop: 5,
    fontSize: 11,
    lineHeight: 16,
    color: "#7B8CA3",
    paddingRight: 10,
  },

  arrow: {
    position: "absolute",
    right: 13,
    bottom: 12,
    fontSize: 22,
    color: "#AAB7C6",
  },

  infoCard: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 16,
    padding: 13,
    borderRadius: 15,
    backgroundColor: "#F3F8FC",
    borderWidth: 1,
    borderColor: "#E3EDF5",
  },

  activeInfoCard: {
    backgroundColor: "#F0FAF5",
    borderColor: "#D8F0E2",
  },

  completedInfoCard: {
    backgroundColor: "#F1F7FD",
    borderColor: "#DCECF9",
  },

  autoInfoCard: {
    backgroundColor: "#FFF9ED",
    borderColor: "#F7E7C1",
  },

  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#E2EEF7",
    alignItems: "center",
    justifyContent: "center",
  },

  activeInfoIcon: {
    backgroundColor: "#DDF4E7",
  },

  completedInfoIcon: {
    backgroundColor: "#E0EFFB",
  },

  autoInfoIcon: {
    backgroundColor: "#FFEEC8",
  },

  infoIconText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#1677B8",
  },

  infoContent: {
    flex: 1,
    marginLeft: 10,
  },

  infoTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#102A56",
  },

  infoText: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    color: "#718096",
  },

  logoutButton: {
    height: 48,
    marginHorizontal: 20,
    marginTop: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FFD7D7",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
  },

  logoutIcon: {
    marginRight: 7,
    fontSize: 17,
    color: "#D94A4A",
    fontWeight: "700",
  },

  logoutText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#D94A4A",
  },
});