// mobile/app/employee/profile.tsx

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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>
            ← Back
          </Text>
        </Pressable>

        <Text style={styles.title}>
          Profile
        </Text>

        <View style={styles.spacer} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
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
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
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

          <View style={styles.card}>
            <Text style={styles.section}>
              EMPLOYEE INFORMATION
            </Text>

            <View style={styles.row}>
              <Text style={styles.label}>
                Employee ID
              </Text>

              <Text style={styles.value}>
                {profile?.employeeId}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.label}>
                Status
              </Text>

              <Text
                style={[
                  styles.value,
                  styles.active,
                ]}
              >
                {profile?.isActive === false
                  ? "Inactive"
                  : "Active"}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() =>
              router.push("/employee/history")
            }
            style={styles.action}
          >
            <View>
              <Text style={styles.actionTitle}>
                Attendance History
              </Text>

              <Text style={styles.actionText}>
                View previous attendance
              </Text>
            </View>

            <Text style={styles.arrow}>
              ›
            </Text>
          </Pressable>

          <Pressable
            onPress={handleLogout}
            style={styles.logout}
          >
            <Text style={styles.logoutText}>
              Logout
            </Text>
          </Pressable>
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
    fontSize: 15,
    fontWeight: "600",
    color: "#2563eb",
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

  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    marginTop: 15,
  },

  avatarText: {
    fontSize: 34,
    fontWeight: "800",
    color: "#ffffff",
  },

  name: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    marginTop: 14,
    marginBottom: 24,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
  },

  section: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: "#9ca3af",
    marginBottom: 16,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  label: {
    fontSize: 14,
    color: "#6b7280",
  },

  value: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },

  active: {
    color: "#16a34a",
  },

  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 16,
  },

  action: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  actionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },

  actionText: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
  },

  arrow: {
    fontSize: 28,
    color: "#9ca3af",
  },

  logout: {
    height: 52,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fecaca",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  logoutText: {
    color: "#dc2626",
    fontSize: 15,
    fontWeight: "700",
  },

  error: {
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 16,
  },

  retry: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 9,
  },

  retryText: {
    color: "#ffffff",
    fontWeight: "700",
  },
});