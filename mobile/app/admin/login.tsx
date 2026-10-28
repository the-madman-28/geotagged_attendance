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

import { useAdminAuth } from "../../src/context/AdminAuthContext";

export default function AdminLoginScreen() {
  const { login } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await login(email.trim(), password);

      router.replace("/admin/dashboard");
    } catch (err: any) {
      setError(
        err?.message ||
          "Admin login failed. Please try again."
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
          Platform.OS === "ios" ? "padding" : undefined
        }
      >
        <View style={styles.backgroundGlow} />
        <View style={styles.backgroundGlowSmall} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand */}
          <View style={styles.brandSection}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../../assets/images/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.brandTitle}>
              Geotagged
            </Text>

            <Text style={styles.brandTitleBlue}>
              Attendance
            </Text>

            <Text style={styles.brandSubtitle}>
              Administration Portal
            </Text>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>
                  A
                </Text>
              </View>

              <View style={styles.headerText}>
                <Text style={styles.cardTitle}>
                  Admin Login
                </Text>

                <Text style={styles.cardSubtitle}>
                  Sign in to manage your attendance system
                </Text>
              </View>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <View style={styles.errorIcon}>
                  <Text style={styles.errorIconText}>
                    !
                  </Text>
                </View>

                <Text style={styles.errorText}>
                  {error}
                </Text>
              </View>
            ) : null}

            {/* Email */}
            <Text style={styles.label}>Email</Text>

            <View
              style={[
                styles.inputContainer,
                error && styles.inputContainerError,
              ]}
            >
              <View style={styles.inputIcon}>
                <Text style={styles.inputIconText}>
                  @
                </Text>
              </View>

              <TextInput
                value={email}
                onChangeText={(value) => {
                  setEmail(value);

                  if (error) {
                    setError("");
                  }
                }}
                placeholder="admin@attendance.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                returnKeyType="next"
                style={styles.input}
              />
            </View>

            {/* Password */}
            <Text style={styles.label}>
              Password
            </Text>

            <View
              style={[
                styles.passwordContainer,
                error && styles.inputContainerError,
              ]}
            >
              <View style={styles.inputIcon}>
                <Text style={styles.inputIconText}>
                  •
                </Text>
              </View>

              <TextInput
                value={password}
                onChangeText={(value) => {
                  setPassword(value);

                  if (error) {
                    setError("");
                  }
                }}
                placeholder="Enter your password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                style={styles.passwordInput}
              />

              <Pressable
                onPress={() =>
                  setShowPassword((value) => !value)
                }
                disabled={loading}
                style={({ pressed }) => [
                  styles.showButton,
                  pressed && styles.showButtonPressed,
                ]}
              >
                <Text style={styles.showButtonText}>
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </Pressable>
            </View>

            {/* Login */}
            <Pressable
              style={({ pressed }) => [
                styles.loginButton,
                pressed &&
                  !loading &&
                  styles.loginButtonPressed,
                loading && styles.disabledButton,
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loadingContent}>
                  <ActivityIndicator color="#FFFFFF" />

                  <Text style={styles.loadingText}>
                    Signing in...
                  </Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.loginButtonText}>
                    Login as Admin
                  </Text>

                  <View style={styles.arrowContainer}>
                    <Text style={styles.arrow}>→</Text>
                  </View>
                </View>
              )}
            </Pressable>
          </View>

          {/* Employee Login */}
          <Pressable
            style={({ pressed }) => [
              styles.employeeButton,
              pressed && styles.employeeButtonPressed,
            ]}
            onPress={() => router.replace("/login")}
            disabled={loading}
          >
            <Text style={styles.employeeButtonText}>
              ← Login as Employee
            </Text>
          </Pressable>

          {/* Security indicator */}
          <View style={styles.securityRow}>
            <View style={styles.securityDot} />

            <Text style={styles.securityText}>
              Secure administrator access
            </Text>
          </View>

          <Text style={styles.footer}>
            © 2026 Made by Madman
          </Text>
        </ScrollView>

        {/* Decorative map lines */}
        <View
          pointerEvents="none"
          style={styles.mapDecoration}
        >
          <View style={styles.mapLineOne} />
          <View style={styles.mapLineTwo} />

          <View style={styles.mapPointOne}>
            <View style={styles.mapPointInner} />
          </View>

          <View style={styles.mapPointTwo}>
            <View style={styles.mapPointInner} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FBFF",
  },

  flex: {
    flex: 1,
  },

  backgroundGlow: {
    position: "absolute",
    width: 420,
    height: 260,
    borderRadius: 220,
    top: -150,
    left: -100,
    backgroundColor: "#E4F4FF",
  },

  backgroundGlowSmall: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 115,
    top: -80,
    right: -80,
    backgroundColor: "#D1EDFF",
    opacity: 0.65,
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 70,
  },

  brandSection: {
    alignItems: "center",
    width: "100%",
  },

  logoContainer: {
    width: 78,
    height: 78,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },

  logo: {
    width: 74,
    height: 74,
  },

  brandTitle: {
    fontSize: 27,
    lineHeight: 31,
    fontWeight: "800",
    color: "#102A56",
    letterSpacing: -0.7,
  },

  brandTitleBlue: {
    fontSize: 27,
    lineHeight: 31,
    fontWeight: "800",
    color: "#1688F7",
    letterSpacing: -0.7,
  },

  brandSubtitle: {
    marginTop: 7,
    fontSize: 12,
    color: "#718096",
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  card: {
    width: "100%",
    marginTop: 24,
    padding: 22,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",

    shadowColor: "#0B4F8A",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.09,
    shadowRadius: 28,

    elevation: 7,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  adminBadge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF6FF",
  },

  adminBadgeText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1688F7",
  },

  headerText: {
    flex: 1,
    marginLeft: 12,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#102A56",
  },

  cardSubtitle: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    color: "#718096",
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: "#FFF7F7",
    borderWidth: 1,
    borderColor: "#F4C7C7",
  },

  errorIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
    marginRight: 8,
  },

  errorIconText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#DC2626",
  },

  errorText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: "#C24141",
  },

  label: {
    marginBottom: 8,
    fontSize: 12,
    fontWeight: "700",
    color: "#52647D",
  },

  inputContainer: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D7E3F0",
    borderRadius: 15,
    backgroundColor: "#FBFDFF",
    marginBottom: 16,
  },

  passwordContainer: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D7E3F0",
    borderRadius: 15,
    backgroundColor: "#FBFDFF",
    marginBottom: 20,
  },

  inputContainerError: {
    borderColor: "#F2A4A4",
    backgroundColor: "#FFF9F9",
  },

  inputIcon: {
    width: 46,
    alignItems: "center",
    justifyContent: "center",
  },

  inputIconText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1688F7",
  },

  input: {
    flex: 1,
    height: "100%",
    paddingRight: 14,
    fontSize: 15,
    color: "#102A56",
    fontWeight: "600",
  },

  passwordInput: {
    flex: 1,
    height: "100%",
    paddingRight: 8,
    fontSize: 15,
    color: "#102A56",
    fontWeight: "600",
  },

  showButton: {
    height: "100%",
    paddingHorizontal: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  showButtonPressed: {
    opacity: 0.55,
  },

  showButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1688F7",
  },

  loginButton: {
    height: 56,
    borderRadius: 15,
    backgroundColor: "#1688F7",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#1688F7",
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.22,
    shadowRadius: 12,

    elevation: 5,
  },

  loginButtonPressed: {
    transform: [{ scale: 0.98 }],
  },

  disabledButton: {
    opacity: 0.72,
  },

  buttonContent: {
    width: "100%",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  arrowContainer: {
    position: "absolute",
    right: 16,
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },

  arrow: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "500",
  },

  loadingContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  loadingText: {
    marginLeft: 9,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  employeeButton: {
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  employeeButtonPressed: {
    opacity: 0.6,
  },

  employeeButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1688F7",
  },

  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  securityDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#22A866",
    marginRight: 6,
  },

  securityText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#7B8CA3",
  },

  footer: {
    marginTop: 18,
    fontSize: 11,
    fontWeight: "500",
    color: "#7B8CA3",
  },

  mapDecoration: {
    position: "absolute",
    bottom: 20,
    left: 0,
    width: "100%",
    height: 80,
    opacity: 0.35,
    zIndex: 0,
  },

  mapLineOne: {
    position: "absolute",
    width: "72%",
    height: 2,
    left: "8%",
    top: 40,
    backgroundColor: "#9DD6FF",
    transform: [{ rotate: "-12deg" }],
  },

  mapLineTwo: {
    position: "absolute",
    width: "55%",
    height: 2,
    right: "10%",
    top: 56,
    backgroundColor: "#B7E1FF",
    transform: [{ rotate: "18deg" }],
  },

  mapPointOne: {
    position: "absolute",
    left: "18%",
    top: 26,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1688F7",
  },

  mapPointTwo: {
    position: "absolute",
    right: "20%",
    top: 45,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#22A866",
  },

  mapPointInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
  },
});