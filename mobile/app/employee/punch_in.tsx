import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
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

import AppBackground from "../../src/components/AppBackground";
import AppHeader from "../../src/components/AppHeader";
import AppCard from "../../src/components/AppCard";
import AppFooter from "../../src/components/AppFooter";
import SuccessModal from "../../src/components/SuccessModal";

export default function PunchInScreen() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [location, setLocation] =
    useState<CurrentLocation | null>(null);
  const [showReason, setShowReason] = useState(false);
  const [reason, setReason] = useState("");

  const [successModalVisible, setSuccessModalVisible] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState("Your attendance has been marked successfully.");

  const [successDetails, setSuccessDetails] =
    useState<string[]>([]);

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

      const attendance = result.attendance;

      const punchInTime = new Date(
        attendance.punchIn
      ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const locationStatus =
        attendance.punchInStatus === "IN_RANGE"
          ? "Location: Inside workplace"
          : "Location: Outside workplace";

      setSuccessMessage(
        result.message ||
          "Your attendance has been marked successfully."
      );

      setSuccessDetails([
        `Punch-in time: ${punchInTime}`,
        locationStatus,
        `Distance: ${Math.round(
          attendance.punchInDistance
        )} m`,
      ]);

      setSuccessModalVisible(true);
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

  function closeSuccessModal() {
    setSuccessModalVisible(false);
    router.replace("/employee/dashboard");
  }

  return (
    <AppBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            onPress={() => router.back()}
            disabled={loading}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>‹</Text>

            <Text style={styles.backText}>
              Back
            </Text>
          </Pressable>

          <AppHeader
            title="Punch In"
            subtitle="Start your attendance session"
          />

          <AppCard style={styles.locationCard}>
            <View style={styles.locationIcon}>
              <Text style={styles.locationIconText}>
                ◎
              </Text>
            </View>

            <Text style={styles.cardTitle}>
              Location Verification
            </Text>

            <Text style={styles.description}>
              Your current GPS location will be
              checked against the registered
              workplace.
            </Text>

            {location && (
              <View style={styles.locationDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    Latitude
                  </Text>

                  <Text style={styles.detailValue}>
                    {location.latitude.toFixed(6)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    Longitude
                  </Text>

                  <Text style={styles.detailValue}>
                    {location.longitude.toFixed(6)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    GPS Accuracy
                  </Text>

                  <Text style={styles.detailValue}>
                    {location.accuracy.toFixed(1)} m
                  </Text>
                </View>
              </View>
            )}
          </AppCard>

          {showReason ? (
            <AppCard style={styles.reasonCard}>
              <View style={styles.warningIcon}>
                <Text style={styles.warningIconText}>
                  !
                </Text>
              </View>

              <Text style={styles.reasonTitle}>
                Outside Workplace
              </Text>

              <Text style={styles.description}>
                Your location is outside the
                allowed workplace radius. Please
                provide a reason to continue.
              </Text>

              <TextInput
                value={reason}
                onChangeText={setReason}
                placeholder="Enter reason"
                placeholderTextColor="#9AA8B8"
                multiline
                editable={!loading}
                style={styles.input}
              />

              <Pressable
                onPress={submitReason}
                disabled={loading}
                style={[
                  styles.primaryButton,
                  loading &&
                    styles.buttonDisabled,
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>
                    Submit Attendance
                  </Text>
                )}
              </Pressable>
            </AppCard>
          ) : (
            <>
              <AppCard style={styles.infoCard}>
                <Text style={styles.infoTitle}>
                  Before punching in
                </Text>

                <View style={styles.checkRow}>
                  <Text style={styles.checkIcon}>
                    ✓
                  </Text>

                  <Text style={styles.infoText}>
                    Enable GPS on your device
                  </Text>
                </View>

                <View style={styles.checkRow}>
                  <Text style={styles.checkIcon}>
                    ✓
                  </Text>

                  <Text style={styles.infoText}>
                    Allow location permission
                  </Text>
                </View>

                <View style={styles.checkRow}>
                  <Text style={styles.checkIcon}>
                    ✓
                  </Text>

                  <Text style={styles.infoText}>
                    Stay near your workplace
                  </Text>
                </View>
              </AppCard>

              <Pressable
                onPress={() => submitPunchIn()}
                disabled={loading}
                style={[
                  styles.primaryButton,
                  loading &&
                    styles.buttonDisabled,
                ]}
              >
                {loading ? (
                  <View style={styles.loading}>
                    <ActivityIndicator color="#FFFFFF" />

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

          <AppFooter />
        </ScrollView>
      </SafeAreaView>

      <SuccessModal
        visible={successModalVisible}
        title="Punch In Successful"
        message={successMessage}
        details={successDetails}
        buttonText="Continue"
        onClose={closeSuccessModal}
      />
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  content: {
    paddingBottom: 18,
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

  locationCard: {
    marginHorizontal: 20,
    marginBottom: 15,
    alignItems: "center",
  },

  locationIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#EAF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },

  locationIconText: {
    fontSize: 31,
    fontWeight: "700",
    color: "#1677B8",
  },

  cardTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#102A56",
  },

  description: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 19,
    color: "#718096",
    textAlign: "center",
  },

  locationDetails: {
    width: "100%",
    marginTop: 18,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#F5FAFE",
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },

  detailLabel: {
    fontSize: 12,
    color: "#7B8CA3",
  },

  detailValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#304B67",
  },

  reasonCard: {
    marginHorizontal: 20,
    marginBottom: 15,
  },

  warningIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FFF4DD",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  warningIconText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#C78600",
  },

  reasonTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#102A56",
  },

  input: {
    minHeight: 105,
    borderWidth: 1,
    borderColor: "#D8E2EC",
    borderRadius: 14,
    padding: 13,
    fontSize: 14,
    color: "#102A56",
    textAlignVertical: "top",
    marginTop: 16,
    marginBottom: 14,
    backgroundColor: "#FBFDFF",
  },

  infoCard: {
    marginHorizontal: 20,
    marginBottom: 15,
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#102A56",
    marginBottom: 12,
  },

  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },

  checkIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#E8F8F0",
    color: "#22A866",
    textAlign: "center",
    lineHeight: 22,
    fontSize: 12,
    fontWeight: "800",
    marginRight: 9,
  },

  infoText: {
    fontSize: 13,
    color: "#66788B",
  },

  primaryButton: {
    height: 54,
    marginHorizontal: 20,
    borderRadius: 15,
    backgroundColor: "#1677B8",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1677B8",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  loading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});