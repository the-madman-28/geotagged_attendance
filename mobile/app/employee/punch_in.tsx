// mobile/app/employee/punch_in.tsx

import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../src/context/AuthContext";
import { punchIn } from "../../src/api/attendance";
import {
  CurrentLocation,
  getCurrentLocation,
} from "../../src/services/location.service";

export default function PunchInScreen() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [location, setLocation] =
    useState<CurrentLocation | null>(null);
  const [showReason, setShowReason] = useState(false);
  const [reason, setReason] = useState("");

  async function submitPunchIn(
    submittedReason?: string
  ) {
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setLoading(true);

      const currentLocation =
        location ?? (await getCurrentLocation());

      setLocation(currentLocation);

      const result = await punchIn(token, {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        accuracy: currentLocation.accuracy,
        ...(submittedReason
          ? { reason: submittedReason }
          : {}),
      });

      Alert.alert(
        "Punch In Successful",
        result.message,
        [
          {
            text: "OK",
            onPress: () =>
              router.replace("/employee/dashboard"),
          },
        ]
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to punch in.";

      if (
        message.toLowerCase().includes("reason")
      ) {
        setShowReason(true);
      } else {
        Alert.alert(
          "Punch In Failed",
          message
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function submitReason() {
    const value = reason.trim();

    if (!value) {
      Alert.alert(
        "Reason Required",
        "Please enter a reason."
      );
      return;
    }

    await submitPunchIn(value);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.back}>
              ← Back
            </Text>
          </Pressable>

          <Text style={styles.title}>
            Punch In
          </Text>

          <View style={styles.spacer} />
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.icon}>📍</Text>

            <Text style={styles.cardTitle}>
              Location Verification
            </Text>

            <Text style={styles.description}>
              Your current location will be
              verified against the workplace.
            </Text>

            {location && (
              <View style={styles.location}>
                <Text style={styles.detail}>
                  Latitude:{" "}
                  {location.latitude.toFixed(6)}
                </Text>

                <Text style={styles.detail}>
                  Longitude:{" "}
                  {location.longitude.toFixed(6)}
                </Text>

                <Text style={styles.detail}>
                  Accuracy:{" "}
                  {location.accuracy.toFixed(1)} m
                </Text>
              </View>
            )}
          </View>

          {showReason ? (
            <View style={styles.card}>
              <Text style={styles.reasonTitle}>
                Outside Workplace
              </Text>

              <Text style={styles.description}>
                Your location is outside the
                allowed workplace radius. Please
                provide a reason.
              </Text>

              <TextInput
                value={reason}
                onChangeText={setReason}
                placeholder="Enter reason"
                placeholderTextColor="#9ca3af"
                multiline
                editable={!loading}
                style={styles.input}
              />

              <Pressable
                onPress={submitReason}
                disabled={loading}
                style={[
                  styles.button,
                  loading &&
                    styles.buttonDisabled,
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>
                    Submit Attendance
                  </Text>
                )}
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.info}>
                <Text style={styles.infoTitle}>
                  Before punching in
                </Text>

                <Text style={styles.infoText}>
                  • Enable GPS
                </Text>

                <Text style={styles.infoText}>
                  • Allow location permission
                </Text>

                <Text style={styles.infoText}>
                  • Stay near your workplace
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  submitPunchIn()
                }
                disabled={loading}
                style={[
                  styles.button,
                  loading &&
                    styles.buttonDisabled,
                ]}
              >
                {loading ? (
                  <View style={styles.loading}>
                    <ActivityIndicator color="#fff" />

                    <Text style={styles.buttonText}>
                      Getting Location...
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>
                    Punch In
                  </Text>
                )}
              </Pressable>
            </>
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
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  back: {
    color: "#2563eb",
    fontSize: 15,
    fontWeight: "600",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  spacer: {
    width: 50,
  },

  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 22,
    marginBottom: 16,
  },

  icon: {
    fontSize: 40,
    textAlign: "center",
    marginBottom: 10,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    color: "#111827",
  },

  description: {
    fontSize: 14,
    lineHeight: 21,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
  },

  location: {
    marginTop: 18,
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#f9fafb",
  },

  detail: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 5,
  },

  info: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 18,
  },

  infoTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },

  infoText: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 6,
  },

  reasonTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  input: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: "#111827",
    textAlignVertical: "top",
    marginTop: 16,
    marginBottom: 14,
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

  loading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});