import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Location from "expo-location";
import { router } from "expo-router";

import { useAuth } from "../src/context/AuthContext";
import { punchOut } from "../src/api/attendance";

export default function PunchOutScreen() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);

  const [location, setLocation] =
    useState<Location.LocationObject | null>(null);

  const [showReason, setShowReason] =
    useState(false);

  const [reason, setReason] = useState("");

  async function handlePunchOut(
    submittedReason?: string
  ) {
    if (!token) {
      Alert.alert(
        "Session Expired",
        "Please login again."
      );

      router.replace("/login");
      return;
    }

    setLoading(true);

    try {
      let currentLocation = location;

      /*
       * Get current GPS location.
       */
      if (!currentLocation) {
        const { status } =
          await Location.requestForegroundPermissionsAsync();

        if (
          status !==
          Location.PermissionStatus.GRANTED
        ) {
          Alert.alert(
            "Location Permission Required",
            "Location permission is required to punch out."
          );

          return;
        }

        currentLocation =
          await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });

        setLocation(currentLocation);
      }

      const {
        latitude,
        longitude,
        accuracy,
      } = currentLocation.coords;

      if (accuracy === null) {
        Alert.alert(
          "GPS Accuracy Unavailable",
          "Unable to determine GPS accuracy. Please try again."
        );

        return;
      }

      const result = await punchOut(token, {
        latitude,
        longitude,
        accuracy,
        ...(submittedReason
          ? { reason: submittedReason }
          : {}),
      });

      Alert.alert(
        "Punch Out Successful",
        result.message,
        [
          {
            text: "OK",
            onPress: () =>
              router.replace("/dashboard"),
          },
        ]
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to punch out.";

      /*
       * Backend requires a reason when the
       * employee is outside the workplace.
       */
      if (
        message
          .toLowerCase()
          .includes("reason")
      ) {
        setShowReason(true);
        return;
      }

      Alert.alert(
        "Punch Out Failed",
        message
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitReason() {
    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      Alert.alert(
        "Reason Required",
        "Please provide a reason for punching out outside the workplace."
      );

      return;
    }

    await handlePunchOut(trimmedReason);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.backText}>
              ← Back
            </Text>
          </Pressable>

          <Text style={styles.title}>
            Punch Out
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          {/* Location Card */}
          <View style={styles.locationCard}>
            <Text style={styles.locationIcon}>
              📍
            </Text>

            <Text style={styles.cardTitle}>
              Location Verification
            </Text>

            <Text style={styles.description}>
              Your current location will be checked
              when you punch out.
            </Text>

            {location && (
              <View style={styles.locationDetails}>
                <Text style={styles.detailText}>
                  Latitude:{" "}
                  {location.coords.latitude.toFixed(6)}
                </Text>

                <Text style={styles.detailText}>
                  Longitude:{" "}
                  {location.coords.longitude.toFixed(6)}
                </Text>

                <Text style={styles.detailText}>
                  Accuracy:{" "}
                  {location.coords.accuracy?.toFixed(1)}
                  {" "}meters
                </Text>
              </View>
            )}
          </View>

          {/* Reason Card */}
          {showReason && (
            <View style={styles.reasonCard}>
              <Text style={styles.reasonTitle}>
                You are outside the workplace
              </Text>

              <Text style={styles.reasonDescription}>
                Please provide a reason before
                submitting your punch out.
              </Text>

              <TextInput
                value={reason}
                onChangeText={setReason}
                placeholder="Enter reason"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={4}
                editable={!loading}
                style={styles.reasonInput}
              />

              <Pressable
                onPress={handleSubmitReason}
                disabled={loading}
                style={[
                  styles.button,
                  loading &&
                    styles.buttonDisabled,
                ]}
              >
                {loading ? (
                  <ActivityIndicator
                    color="#ffffff"
                  />
                ) : (
                  <Text style={styles.buttonText}>
                    Submit Punch Out
                  </Text>
                )}
              </Pressable>
            </View>
          )}

          {/* Information */}
          {!showReason && (
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>
                Before punching out
              </Text>

              <Text style={styles.infoItem}>
                • Make sure GPS is enabled
              </Text>

              <Text style={styles.infoItem}>
                • Allow location permission
              </Text>

              <Text style={styles.infoItem}>
                • Your location will be recorded
              </Text>
            </View>
          )}

          {/* Punch Out Button */}
          {!showReason && (
            <Pressable
              onPress={() => handlePunchOut()}
              disabled={loading}
              style={[
                styles.button,
                loading &&
                  styles.buttonDisabled,
              ]}
            >
              {loading ? (
                <View style={styles.loadingContent}>
                  <ActivityIndicator
                    color="#ffffff"
                  />

                  <Text style={styles.buttonText}>
                    Checking Location...
                  </Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>
                  Punch Out
                </Text>
              )}
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },

  container: {
    flex: 1,
  },

  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  backText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2563eb",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  headerSpacer: {
    width: 50,
  },

  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },

  locationCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  locationIcon: {
    fontSize: 42,
    marginBottom: 12,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },

  description: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    color: "#6b7280",
  },

  locationDetails: {
    width: "100%",
    marginTop: 20,
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#f9fafb",
  },

  detailText: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 5,
  },

  reasonCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },

  reasonTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },

  reasonDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: "#6b7280",
    marginBottom: 14,
  },

  reasonInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: "#111827",
    textAlignVertical: "top",
    marginBottom: 14,
  },

  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },

  infoTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 10,
  },

  infoItem: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 6,
  },

  button: {
    height: 52,
    borderRadius: 10,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  loadingContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
