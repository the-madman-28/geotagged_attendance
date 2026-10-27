import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState } from "react";

import { useAuth } from "../src/context/AuthContext";

export default function LoginScreen() {
  const { employeeLogin } = useAuth();

  const [employeeId, setEmployeeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!employeeId.trim()) {
      setError("Please enter your employee ID.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await employeeLogin(employeeId.trim());

      router.replace("/employee/dashboard");
    } catch (err: any) {
      setError(
        err?.message ||
          "Login failed. Please check your employee ID."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>
              Employee Login
            </Text>

            <Text style={styles.subtitle}>
              Sign in to mark your attendance
            </Text>
          </View>

          <View style={styles.card}>
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>
                  {error}
                </Text>
              </View>
            ) : null}

            <Text style={styles.label}>
              Employee ID
            </Text>

            <TextInput
              value={employeeId}
              onChangeText={setEmployeeId}
              placeholder="e.g. EMP001"
              placeholderTextColor="#94a3b8"
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!loading}
              style={styles.input}
            />

            <Pressable
              style={[
                styles.loginButton,
                loading && styles.disabledButton,
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.loginButtonText}>
                  Login
                </Text>
              )}
            </Pressable>
          </View>

          <Pressable
            style={styles.adminButton}
            onPress={() => router.push("/admin/login")}
            disabled={loading}
          >
            <Text style={styles.adminButtonText}>
              Login as Admin
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  flex: {
    flex: 1,
  },

  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },

  header: {
    marginBottom: 24,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#0f172a",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#64748b",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  errorBox: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },

  errorText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#b91c1c",
  },

  label: {
    marginBottom: 7,
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 20,
    fontSize: 15,
    color: "#0f172a",
    backgroundColor: "#ffffff",
  },

  loginButton: {
    height: 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
  },

  disabledButton: {
    opacity: 0.7,
  },

  loginButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },

  adminButton: {
    alignSelf: "center",
    marginTop: 20,
    padding: 10,
  },

  adminButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563eb",
  },
});