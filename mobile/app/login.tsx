import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { useAuth } from "../src/context/AuthContext";

export default function LoginScreen() {
  const { employeeLogin } = useAuth();

  const [organizationSlug, setOrganizationSlug] =
    useState("");

  const [employeeId, setEmployeeId] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleLogin = async () => {
    const trimmedOrganizationSlug =
      organizationSlug.trim().toLowerCase();

    const trimmedEmployeeId =
      employeeId.trim().toUpperCase();

    if (!trimmedOrganizationSlug) {
      setError("Please enter your Organization Slug.");
      return;
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
      trimmedOrganizationSlug
    )) {
      setError(
        "Please enter a valid Organization Slug."
      );
      return;
    }

    if (!trimmedEmployeeId) {
      setError("Please enter your Employee ID.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await employeeLogin(
        trimmedOrganizationSlug,
        trimmedEmployeeId
      );

      router.replace("/employee/dashboard");
    } catch (err: any) {
      setError(
        err?.message ||
          "Unable to login. Please check your organization and Employee ID."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <View style={styles.topGlow} />
        <View style={styles.topGlowSecondary} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand */}
          <View style={styles.brandSection}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../assets/images/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.title}>
              Geotagged
            </Text>

            <Text style={styles.titleBlue}>
              Attendance
            </Text>

            <Text style={styles.subtitle}>
              Be Present. Stay Connected.
            </Text>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.loginBadge}>
                <Text style={styles.loginBadgeIcon}>
                  ID
                </Text>
              </View>

              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>
                  Employee Login
                </Text>

                <Text style={styles.cardSubtitle}>
                  Enter your organization and Employee ID
                </Text>
              </View>
            </View>

            {/* Organization Slug */}
            <Text style={styles.inputLabel}>
              Organization
            </Text>

            <View
              style={[
                styles.inputContainer,
                error &&
                  styles.inputContainerError,
              ]}
            >
              <View style={styles.inputIcon}>
                <Text style={styles.inputIconText}>
                  ◉
                </Text>
              </View>

              <TextInput
                style={styles.input}
                placeholder="e.g. acme-corporation"
                placeholderTextColor="#94A3B8"
                value={organizationSlug}
                onChangeText={(text) => {
                  const formatted = text
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(
                      /[^a-z0-9-]/g,
                      ""
                    )
                    .replace(/-+/g, "-");

                  setOrganizationSlug(formatted);

                  if (error) {
                    setError("");
                  }
                }}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                returnKeyType="next"
              />
            </View>

            <Text style={styles.helperText}>
              Use the organization slug provided by your
              administrator.
            </Text>

            {/* Employee ID */}
            <Text style={styles.inputLabel}>
              Employee ID
            </Text>

            <View
              style={[
                styles.inputContainer,
                error &&
                  styles.inputContainerError,
              ]}
            >
              <View style={styles.inputIcon}>
                <Text style={styles.inputIconText}>
                  ◉
                </Text>
              </View>

              <TextInput
                style={styles.input}
                placeholder="e.g. EMP001"
                placeholderTextColor="#94A3B8"
                value={employeeId}
                onChangeText={(text) => {
                  setEmployeeId(
                    text.toUpperCase()
                  );

                  if (error) {
                    setError("");
                  }
                }}
                autoCapitalize="characters"
                autoCorrect={false}
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
            </View>

            {/* Error */}
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  {error}
                </Text>
              </View>
            ) : null}

            {/* Login Button */}
            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={({ pressed }) => [
                styles.loginButton,
                pressed &&
                  !loading &&
                  styles.loginButtonPressed,
                loading &&
                  styles.loginButtonDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Text style={styles.loginButtonText}>
                  Continue
                </Text>
              )}
            </Pressable>

            <Text style={styles.deviceNote}>
              Your device is securely registered
              automatically during login.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },

  topGlow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#DBEAFE",
    opacity: 0.45,
    top: -100,
    right: -80,
  },

  topGlowSecondary: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#E0F2FE",
    opacity: 0.35,
    bottom: -80,
    left: -70,
  },

  brandSection: {
    alignItems: "center",
    marginBottom: 28,
  },

  logoContainer: {
    width: 74,
    height: 74,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  logo: {
    width: 54,
    height: 54,
  },

  title: {
    fontSize: 27,
    fontWeight: "800",
    color: "#0F172A",
    lineHeight: 31,
  },

  titleBlue: {
    fontSize: 27,
    fontWeight: "800",
    color: "#2563EB",
    lineHeight: 31,
  },

  subtitle: {
    marginTop: 7,
    fontSize: 13,
    color: "#64748B",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 4,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  loginBadge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  loginBadgeIcon: {
    fontSize: 14,
    fontWeight: "800",
    color: "#2563EB",
  },

  cardHeaderText: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },

  cardSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: "#64748B",
    lineHeight: 17,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },

  inputContainer: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
  },

  inputContainerError: {
    borderColor: "#FCA5A5",
  },

  inputIcon: {
    width: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  inputIconText: {
    fontSize: 15,
    color: "#64748B",
  },

  input: {
    flex: 1,
    height: "100%",
    paddingRight: 14,
    fontSize: 14,
    color: "#0F172A",
  },

  helperText: {
    marginTop: 7,
    marginBottom: 18,
    fontSize: 11,
    lineHeight: 16,
    color: "#94A3B8",
  },

  errorContainer: {
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  errorText: {
    fontSize: 12,
    lineHeight: 17,
    color: "#DC2626",
  },

  loginButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },

  loginButtonPressed: {
    opacity: 0.85,
  },

  loginButtonDisabled: {
    opacity: 0.6,
  },

  loginButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  deviceNote: {
    marginTop: 14,
    textAlign: "center",
    fontSize: 11,
    lineHeight: 16,
    color: "#94A3B8",
  },
});