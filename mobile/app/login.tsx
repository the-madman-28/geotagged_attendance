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

  const [employeeId, setEmployeeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    const trimmedEmployeeId = employeeId.trim();

    if (!trimmedEmployeeId) {
      setError("Please enter your Employee ID.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await employeeLogin(trimmedEmployeeId);

      router.replace("/employee/dashboard");
    } catch (err: any) {
      setError(
        err?.message ||
          "Unable to login. Please check your Employee ID."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
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

            <Text style={styles.title}>Geotagged</Text>

            <Text style={styles.titleBlue}>Attendance</Text>

            <Text style={styles.subtitle}>
              Be Present. Stay Connected.
            </Text>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.loginBadge}>
                <Text style={styles.loginBadgeIcon}>ID</Text>
              </View>

              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>
                  Employee Login
                </Text>

                <Text style={styles.cardSubtitle}>
                  Enter your Employee ID to continue
                </Text>
              </View>
            </View>

            <Text style={styles.inputLabel}>Employee ID</Text>

            <View
              style={[
                styles.inputContainer,
                error && styles.inputContainerError,
              ]}
            >
              <View style={styles.inputIcon}>
                <Text style={styles.inputIconText}>◉</Text>
              </View>

              <TextInput
                style={styles.input}
                placeholder="e.g. EMP001"
                placeholderTextColor="#94A3B8"
                value={employeeId}
                onChangeText={(text) => {
                  setEmployeeId(text.toUpperCase());

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

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>!</Text>

                <Text style={styles.errorText}>
                  {error}
                </Text>
              </View>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.loginButton,
                pressed &&
                  !loading &&
                  styles.loginButtonPressed,
                loading && styles.loginButtonDisabled,
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
                    Continue
                  </Text>

                  <View style={styles.arrowContainer}>
                    <Text style={styles.arrow}>→</Text>
                  </View>
                </View>
              )}
            </Pressable>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />

              <Text style={styles.dividerText}>OR</Text>

              <View style={styles.dividerLine} />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.adminButton,
                pressed && styles.adminButtonPressed,
              ]}
              onPress={() => router.push("/admin/login")}
              disabled={loading}
            >
              <Text style={styles.adminButtonText}>
                Admin Login
              </Text>

              <Text style={styles.adminArrow}>→</Text>
            </Pressable>
          </View>

          {/* Trust indicators */}
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <View style={styles.infoDot} />

              <Text style={styles.infoText}>
                Location verified
              </Text>
            </View>

            <View style={styles.infoItem}>
              <View
                style={[
                  styles.infoDot,
                  styles.infoDotGreen,
                ]}
              />

              <Text style={styles.infoText}>
                Secure attendance
              </Text>
            </View>
          </View>

          {/* Footer */}
          <Text style={styles.footer}>
            © 2026 Made by Madman
          </Text>
        </ScrollView>

        {/* Decorative map area */}
        <View
          pointerEvents="none"
          style={styles.mapDecoration}
        >
          <View style={styles.mapLineOne} />
          <View style={styles.mapLineTwo} />
          <View style={styles.mapLineThree} />

          <View style={styles.locationPinOne}>
            <View style={styles.pinDot} />
          </View>

          <View style={styles.locationPinTwo}>
            <View style={styles.pinDot} />
          </View>

          <View style={styles.locationPinThree}>
            <View style={styles.pinDot} />
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

  container: {
    flex: 1,
    overflow: "hidden",
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 72,
  },

  topGlow: {
    position: "absolute",
    width: "135%",
    height: 270,
    borderRadius: 200,
    top: -135,
    left: "-18%",
    backgroundColor: "#E4F4FF",
  },

  topGlowSecondary: {
    position: "absolute",
    width: 310,
    height: 310,
    borderRadius: 155,
    top: -105,
    right: -105,
    backgroundColor: "#D1EDFF",
    opacity: 0.65,
  },

  brandSection: {
    alignItems: "center",
    width: "100%",
  },

  logoContainer: {
    width: 92,
    height: 92,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },

  logo: {
    width: 88,
    height: 88,
  },

  title: {
    fontSize: 31,
    lineHeight: 35,
    fontWeight: "800",
    color: "#102A56",
    letterSpacing: -0.8,
  },

  titleBlue: {
    fontSize: 31,
    lineHeight: 35,
    fontWeight: "800",
    color: "#1688F7",
    letterSpacing: -0.8,
  },

  subtitle: {
    marginTop: 8,
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
    letterSpacing: 0.2,
  },

  card: {
    width: "100%",
    marginTop: 25,
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

  loginBadge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#EAF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  loginBadgeIcon: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1688F7",
  },

  cardHeaderText: {
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
    color: "#718096",
  },

  inputLabel: {
    marginBottom: 8,
    fontSize: 12,
    fontWeight: "700",
    color: "#52647D",
  },

  inputContainer: {
    height: 56,
    borderWidth: 1,
    borderColor: "#D7E3F0",
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FBFDFF",
  },

  inputContainerError: {
    borderColor: "#F2A4A4",
    backgroundColor: "#FFF9F9",
  },

  inputIcon: {
    width: 48,
    alignItems: "center",
    justifyContent: "center",
  },

  inputIconText: {
    fontSize: 17,
    color: "#1688F7",
  },

  input: {
    flex: 1,
    height: "100%",
    paddingRight: 16,
    fontSize: 16,
    color: "#102A56",
    fontWeight: "600",
    letterSpacing: 0.4,
  },

  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 4,
  },

  errorIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    textAlign: "center",
    lineHeight: 18,
    backgroundColor: "#FEE2E2",
    color: "#DC2626",
    fontSize: 11,
    fontWeight: "800",
    marginRight: 7,
  },

  errorText: {
    flex: 1,
    fontSize: 12,
    color: "#DC2626",
    lineHeight: 17,
  },

  loginButton: {
    height: 56,
    marginTop: 18,
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

  loginButtonDisabled: {
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
    fontSize: 16,
    fontWeight: "800",
  },

  arrowContainer: {
    position: "absolute",
    right: 16,
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
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

  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E7EEF5",
  },

  dividerText: {
    marginHorizontal: 12,
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "700",
  },

  adminButton: {
    height: 48,
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D7E3F0",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  adminButtonPressed: {
    backgroundColor: "#F5FAFF",
    transform: [{ scale: 0.98 }],
  },

  adminButtonText: {
    color: "#1688F7",
    fontSize: 14,
    fontWeight: "700",
  },

  adminArrow: {
    marginLeft: 8,
    color: "#1688F7",
    fontSize: 18,
  },

  infoRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
    gap: 18,
  },

  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  infoDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#1688F7",
    marginRight: 6,
  },

  infoDotGreen: {
    backgroundColor: "#22A866",
  },

  infoText: {
    fontSize: 10,
    color: "#7B8CA3",
    fontWeight: "600",
  },

  mapDecoration: {
    position: "absolute",
    bottom: 18,
    left: 0,
    width: "100%",
    height: 90,
    opacity: 0.45,
    zIndex: 0,
  },

  mapLineOne: {
    position: "absolute",
    width: "72%",
    height: 2,
    backgroundColor: "#9DD6FF",
    left: "8%",
    top: 48,
    transform: [{ rotate: "-12deg" }],
  },

  mapLineTwo: {
    position: "absolute",
    width: "62%",
    height: 2,
    backgroundColor: "#9DD6FF",
    left: "20%",
    top: 65,
    transform: [{ rotate: "17deg" }],
  },

  mapLineThree: {
    position: "absolute",
    width: "45%",
    height: 2,
    backgroundColor: "#B7E1FF",
    left: "30%",
    top: 35,
    transform: [{ rotate: "28deg" }],
  },

  locationPinOne: {
    position: "absolute",
    left: "18%",
    top: 28,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#1688F7",
    alignItems: "center",
    justifyContent: "center",
  },

  locationPinTwo: {
    position: "absolute",
    right: "20%",
    top: 56,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#22A866",
    alignItems: "center",
    justifyContent: "center",
  },

  locationPinThree: {
    position: "absolute",
    left: "55%",
    top: 18,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#7BC7F8",
    alignItems: "center",
    justifyContent: "center",
  },

  pinDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },

  footer: {
    marginTop: 18,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "500",
    color: "#7B8CA3",
  },
});