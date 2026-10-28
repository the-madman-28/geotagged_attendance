import React, { useCallback, useState } from "react";
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
        <View style={styles.loadingScreen}>
          <View style={styles.loadingBadge}>
            <ActivityIndicator
              size="small"
              color="#1688F7"
            />
          </View>

          <Text style={styles.loadingTitle}>
            Loading dashboard
          </Text>

          <Text style={styles.loadingSubtitle}>
            Preparing your attendance overview...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.backgroundGlow} />
      <View style={styles.backgroundGlowSmall} />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadDashboard(true)}
            tintColor="#1688F7"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.adminLabel}>
              <View style={styles.adminDot} />

              <Text style={styles.adminLabelText}>
                ADMIN PORTAL
              </Text>
            </View>

            <Text style={styles.title}>
              Dashboard
            </Text>

            <Text
              style={styles.subtitle}
              numberOfLines={1}
            >
              {admin?.email || "Administrator"}
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.logoutButtonPressed,
            ]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutIcon}>↗</Text>

            <Text style={styles.logoutText}>
              Logout
            </Text>
          </Pressable>
        </View>

        {/* Error */}
        {error ? (
          <View style={styles.errorBox}>
            <View style={styles.errorIcon}>
              <Text style={styles.errorIconText}>
                !
              </Text>
            </View>

            <View style={styles.errorContent}>
              <Text style={styles.errorTitle}>
                Unable to load dashboard
              </Text>

              <Text style={styles.errorText}>
                {error}
              </Text>

              <Pressable
                style={({ pressed }) => [
                  styles.retryButton,
                  pressed && styles.retryButtonPressed,
                ]}
                onPress={() => loadDashboard()}
              >
                <Text style={styles.retryText}>
                  Try Again
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {/* Overview */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Overview
            </Text>

            <Text style={styles.sectionSubtitle}>
              Today's attendance snapshot
            </Text>
          </View>

          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />

            <Text style={styles.liveText}>
              LIVE
            </Text>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <MetricCard
            title="Employees"
            value={summary?.totalEmployees ?? 0}
            icon="E"
            variant="blue"
          />

          <MetricCard
            title="Active"
            value={summary?.activeEmployees ?? 0}
            icon="✓"
            variant="green"
          />

          <MetricCard
            title="Present Today"
            value={summary?.presentToday ?? 0}
            icon="P"
            variant="navy"
          />

          <MetricCard
            title="Punched In"
            value={summary?.punchedInToday ?? 0}
            icon="→"
            variant="blue"
          />

          <MetricCard
            title="Completed"
            value={summary?.completedToday ?? 0}
            icon="✓"
            variant="green"
          />

          <MetricCard
            title="Out of Range"
            value={summary?.outOfRangeToday ?? 0}
            icon="!"
            variant="amber"
          />
        </View>

        {/* Management */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Management
            </Text>

            <Text style={styles.sectionSubtitle}>
              Manage your attendance system
            </Text>
          </View>
        </View>

        <View style={styles.managementList}>
          <ManagementCard
            title="Employees"
            description="Add, view and manage employees"
            icon="E"
            onPress={() =>
              router.push("/admin/employees")
            }
          />

          <ManagementCard
            title="Workplace"
            description="Configure location and geofence"
            icon="⌖"
            onPress={() =>
              router.push("/admin/workplace")
            }
          />

          <ManagementCard
            title="Attendance"
            description="View today's attendance records"
            icon="✓"
            onPress={() =>
              router.push("/admin/attendance")
            }
          />
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          © 2026 Made by Madman
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({
  title,
  value,
  icon,
  variant,
}: {
  title: string;
  value: number;
  icon: string;
  variant: "blue" | "green" | "navy" | "amber";
}) {
  return (
    <View style={styles.metricCard}>
      <View
        style={[
          styles.metricIcon,
          variant === "blue" && styles.metricIconBlue,
          variant === "green" && styles.metricIconGreen,
          variant === "navy" && styles.metricIconNavy,
          variant === "amber" && styles.metricIconAmber,
        ]}
      >
        <Text
          style={[
            styles.metricIconText,
            variant === "blue" &&
              styles.metricIconTextBlue,
            variant === "green" &&
              styles.metricIconTextGreen,
            variant === "navy" &&
              styles.metricIconTextNavy,
            variant === "amber" &&
              styles.metricIconTextAmber,
          ]}
        >
          {icon}
        </Text>
      </View>

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
  icon,
  onPress,
}: {
  title: string;
  description: string;
  icon: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.managementCard,
        pressed && styles.managementCardPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.managementIcon}>
        <Text style={styles.managementIconText}>
          {icon}
        </Text>
      </View>

      <View style={styles.managementContent}>
        <Text style={styles.managementTitle}>
          {title}
        </Text>

        <Text style={styles.managementDescription}>
          {description}
        </Text>
      </View>

      <View style={styles.managementArrow}>
        <Text style={styles.arrow}>→</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FBFF",
  },

  backgroundGlow: {
    position: "absolute",
    width: 380,
    height: 250,
    borderRadius: 200,
    top: -150,
    right: -130,
    backgroundColor: "#E4F4FF",
  },

  backgroundGlowSmall: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    top: 100,
    left: -150,
    backgroundColor: "#EEF9FF",
    opacity: 0.7,
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 34,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },

  headerContent: {
    flex: 1,
    paddingRight: 14,
  },

  adminLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  adminDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#22A866",
    marginRight: 6,
  },

  adminLabelText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#7B8CA3",
  },

  title: {
    fontSize: 30,
    lineHeight: 35,
    fontWeight: "800",
    color: "#102A56",
    letterSpacing: -0.7,
  },

  subtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#718096",
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: "#FFF3F3",
    borderWidth: 1,
    borderColor: "#F6D7D7",
  },

  logoutButtonPressed: {
    opacity: 0.65,
    transform: [{ scale: 0.97 }],
  },

  logoutIcon: {
    marginRight: 5,
    fontSize: 13,
    fontWeight: "800",
    color: "#D94A4A",
  },

  logoutText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#C24141",
  },

  errorBox: {
    flexDirection: "row",
    marginBottom: 22,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#FFF8F8",
    borderWidth: 1,
    borderColor: "#F4C7C7",
  },

  errorIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
    marginRight: 10,
  },

  errorIconText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#DC2626",
  },

  errorContent: {
    flex: 1,
  },

  errorTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#B91C1C",
  },

  errorText: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: "#C24141",
  },

  retryButton: {
    alignSelf: "flex-start",
    marginTop: 9,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: "#FEE2E2",
  },

  retryButtonPressed: {
    opacity: 0.6,
  },

  retryText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#991B1B",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#102A56",
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: "#7B8CA3",
  },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#ECFDF5",
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22A866",
    marginRight: 5,
  },

  liveText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.7,
    color: "#18824F",
  },

  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 28,
  },

  metricCard: {
    width: "31.8%",
    minHeight: 132,
    padding: 13,
    marginBottom: 10,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",

    shadowColor: "#0B4F8A",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.05,
    shadowRadius: 12,

    elevation: 2,
  },

  metricIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  metricIconBlue: {
    backgroundColor: "#EAF6FF",
  },

  metricIconGreen: {
    backgroundColor: "#EAF9F1",
  },

  metricIconNavy: {
    backgroundColor: "#EEF2FF",
  },

  metricIconAmber: {
    backgroundColor: "#FFF7E8",
  },

  metricIconText: {
    fontSize: 13,
    fontWeight: "800",
  },

  metricIconTextBlue: {
    color: "#1688F7",
  },

  metricIconTextGreen: {
    color: "#22A866",
  },

  metricIconTextNavy: {
    color: "#4057A8",
  },

  metricIconTextAmber: {
    color: "#D88A00",
  },

  metricValue: {
    fontSize: 25,
    lineHeight: 29,
    fontWeight: "800",
    color: "#102A56",
  },

  metricTitle: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 14,
    color: "#718096",
    fontWeight: "600",
  },

  managementList: {
    gap: 11,
  },

  managementCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",

    shadowColor: "#0B4F8A",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.05,
    shadowRadius: 12,

    elevation: 2,
  },

  managementCardPressed: {
    backgroundColor: "#F7FBFF",
    transform: [{ scale: 0.99 }],
  },

  managementIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF6FF",
  },

  managementIconText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1688F7",
  },

  managementContent: {
    flex: 1,
    paddingHorizontal: 12,
  },

  managementTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#102A56",
  },

  managementDescription: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    color: "#7B8CA3",
  },

  managementArrow: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F8FD",
  },

  arrow: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1688F7",
  },

  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  loadingBadge: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF6FF",
  },

  loadingTitle: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: "800",
    color: "#102A56",
  },

  loadingSubtitle: {
    marginTop: 5,
    fontSize: 12,
    color: "#7B8CA3",
  },

  footer: {
    marginTop: 26,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "500",
    color: "#7B8CA3",
  },
});