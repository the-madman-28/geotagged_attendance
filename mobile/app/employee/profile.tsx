import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../src/context/AuthContext";
import { getEmployeeProfile } from "../../src/api/employee";

import AppBackground from "../../src/components/AppBackground";
import AppHeader from "../../src/components/AppHeader";
import AppCard from "../../src/components/AppCard";
import AppFooter from "../../src/components/AppFooter";

export default function ProfileScreen() {
  const { token, employee, logout } = useAuth();

  const [profile, setProfile] =
    useState(employee);

  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result =
        await getEmployeeProfile(token);

      setProfile(result.employee);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load profile."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <AppBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>‹</Text>
            <Text style={styles.backText}>
              Back
            </Text>
          </Pressable>

          <AppHeader
            title="My Profile"
            subtitle="Your employee information"
          />

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" />
            </View>
          ) : error ? (
            <View style={styles.center}>
              <View style={styles.errorIcon}>
                <Text style={styles.errorIconText}>
                  !
                </Text>
              </View>

              <Text style={styles.errorTitle}>
                Unable to load profile
              </Text>

              <Text style={styles.error}>
                {error}
              </Text>

              <Pressable
                onPress={loadProfile}
                style={styles.retry}
              >
                <Text style={styles.retryText}>
                  Try Again
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.profileHero}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {profile?.name
                      ?.charAt(0)
                      .toUpperCase() || "E"}
                  </Text>
                </View>

                <Text style={styles.name}>
                  {profile?.name}
                </Text>

                <Text style={styles.employeeId}>
                  {profile?.employeeId}
                </Text>

                <View style={styles.activeBadge}>
                  <View style={styles.activeDot} />

                  <Text style={styles.activeText}>
                    {profile?.isActive === false
                      ? "Inactive"
                      : "Active Employee"}
                  </Text>
                </View>
              </View>

              <AppCard style={styles.infoCard}>
                <Text style={styles.section}>
                  EMPLOYEE INFORMATION
                </Text>

                <View style={styles.row}>
                  <View>
                    <Text style={styles.label}>
                      Employee ID
                    </Text>

                    <Text style={styles.value}>
                      {profile?.employeeId}
                    </Text>
                  </View>

                  <View style={styles.smallIcon}>
                    <Text style={styles.smallIconText}>
                      ID
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.row}>
                  <View>
                    <Text style={styles.label}>
                      Account Status
                    </Text>

                    <Text style={styles.value}>
                      {profile?.isActive === false
                        ? "Inactive"
                        : "Active"}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      profile?.isActive === false &&
                        styles.inactiveBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        profile?.isActive === false &&
                          styles.inactiveText,
                      ]}
                    >
                      {profile?.isActive === false
                        ? "Inactive"
                        : "Active"}
                    </Text>
                  </View>
                </View>
              </AppCard>

              <Pressable
                onPress={() =>
                  router.push("/employee/history")
                }
                style={({ pressed }) => [
                  styles.actionCard,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.actionIcon}>
                  <Text style={styles.actionIconText}>
                    ◷
                  </Text>
                </View>

                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>
                    Attendance History
                  </Text>

                  <Text style={styles.actionText}>
                    View your previous attendance
                    records
                  </Text>
                </View>

                <Text style={styles.arrow}>›</Text>
              </Pressable>

              <Pressable
                onPress={handleLogout}
                style={({ pressed }) => [
                  styles.logout,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.logoutText}>
                  Logout
                </Text>
              </Pressable>

              <AppFooter />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    paddingBottom: 20,
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

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  profileHero: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 20,
  },

  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#1677B8",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1677B8",
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 5,
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "800",
  },

  name: {
    marginTop: 13,
    fontSize: 23,
    fontWeight: "800",
    color: "#102A56",
    textAlign: "center",
  },

  employeeId: {
    marginTop: 4,
    fontSize: 12,
    color: "#718096",
  },

  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#E8F8F0",
  },

  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22A866",
    marginRight: 6,
  },

  activeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#258255",
  },

  infoCard: {
    marginHorizontal: 20,
    marginBottom: 14,
  },

  section: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#8A99AB",
    marginBottom: 16,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  label: {
    fontSize: 11,
    color: "#8A99AB",
    marginBottom: 4,
  },

  value: {
    fontSize: 14,
    fontWeight: "800",
    color: "#102A56",
  },

  smallIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF6FF",
  },

  smallIconText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#1677B8",
  },

  divider: {
    height: 1,
    backgroundColor: "#EDF2F7",
    marginVertical: 17,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#E8F8F0",
  },

  inactiveBadge: {
    backgroundColor: "#FFF0F0",
  },

  statusBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#258255",
  },

  inactiveText: {
    color: "#D94A4A",
  },

  actionCard: {
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 17,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#0B4F8A",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
  },

  actionIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#EAF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  actionIconText: {
    color: "#1677B8",
    fontSize: 21,
    fontWeight: "700",
  },

  actionContent: {
    flex: 1,
    marginLeft: 12,
  },

  actionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#102A56",
  },

  actionText: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 16,
    color: "#7B8CA3",
  },

  arrow: {
    fontSize: 27,
    color: "#AAB7C6",
    marginLeft: 8,
  },

  logout: {
    height: 50,
    marginHorizontal: 20,
    marginTop: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FFD7D7",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  logoutText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#D94A4A",
  },

  pressed: {
    opacity: 0.8,
  },

  errorIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#FFF0F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  errorIconText: {
    fontSize: 23,
    fontWeight: "800",
    color: "#D94A4A",
  },

  errorTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#102A56",
  },

  error: {
    fontSize: 13,
    lineHeight: 19,
    color: "#718096",
    textAlign: "center",
    marginTop: 5,
    marginBottom: 16,
  },

  retry: {
    backgroundColor: "#1677B8",
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 11,
  },

  retryText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
});