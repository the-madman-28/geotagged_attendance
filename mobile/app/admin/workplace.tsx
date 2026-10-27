import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import {
  createWorkplace,
  getWorkplace,
  updateWorkplace,
} from "../../src/api/admin";

import { useAdminAuth } from "../../src/context/AdminAuthContext";

import { getCurrentLocation } from "../../src/services/location.service";

export default function WorkplaceScreen() {
  const { token } = useAdminAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [exists, setExists] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radiusMeters, setRadiusMeters] = useState("");
  const [maximumSessionHours, setMaximumSessionHours] =
    useState("");
  const [isActive, setIsActive] = useState(true);

  const loadWorkplace = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getWorkplace(token);
      const workplace = response.workplace;

      setExists(true);
      setName(workplace.name);
      setLatitude(String(workplace.latitude));
      setLongitude(String(workplace.longitude));
      setRadiusMeters(String(workplace.radiusMeters));
      setMaximumSessionHours(
        String(workplace.maximumSessionHours)
      );
      setIsActive(workplace.isActive);
    } catch (err: any) {
      if (err?.status === 404) {
        setExists(false);
        setName("");
        setLatitude("");
        setLongitude("");
        setRadiusMeters("50");
        setMaximumSessionHours("12");
        setIsActive(true);
        setError("");
      } else {
        setError(
          err?.message || "Failed to load workplace."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      loadWorkplace();
    }, [loadWorkplace])
  );

  const handleUseCurrentLocation = async () => {
    try {
      setLocating(true);
      setError("");

      const location = await getCurrentLocation();

      setLatitude(location.latitude.toFixed(7));
      setLongitude(location.longitude.toFixed(7));

      Alert.alert(
        "Location Captured",
        "The current GPS location has been added as the workplace coordinates."
      );
    } catch (err: any) {
      Alert.alert(
        "Location Error",
        err?.message ||
          "Unable to get your current location."
      );
    } finally {
      setLocating(false);
    }
  };

  const handleSave = async () => {
    if (!token) {
      return;
    }

    if (!name.trim()) {
      Alert.alert(
        "Validation Error",
        "Please enter a workplace name."
      );
      return;
    }

    const latitudeValue = Number(latitude);
    const longitudeValue = Number(longitude);
    const radiusValue = Number(radiusMeters);
    const sessionHoursValue = Number(
      maximumSessionHours
    );

    if (
      !Number.isFinite(latitudeValue) ||
      latitudeValue < -90 ||
      latitudeValue > 90
    ) {
      Alert.alert(
        "Validation Error",
        "Please enter a valid latitude."
      );
      return;
    }

    if (
      !Number.isFinite(longitudeValue) ||
      longitudeValue < -180 ||
      longitudeValue > 180
    ) {
      Alert.alert(
        "Validation Error",
        "Please enter a valid longitude."
      );
      return;
    }

    if (
      !Number.isFinite(radiusValue) ||
      radiusValue <= 0
    ) {
      Alert.alert(
        "Validation Error",
        "Radius must be greater than 0 meters."
      );
      return;
    }

    if (
      !Number.isFinite(sessionHoursValue) ||
      sessionHoursValue <= 0
    ) {
      Alert.alert(
        "Validation Error",
        "Maximum session hours must be greater than 0."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const data = {
        name: name.trim(),
        latitude: latitudeValue,
        longitude: longitudeValue,
        radiusMeters: radiusValue,
        maximumSessionHours: sessionHoursValue,
        isActive,
      };

      if (exists) {
        await updateWorkplace(token, data);
      } else {
        await createWorkplace(token, data);
        setExists(true);
      }

      Alert.alert(
        "Success",
        "Workplace settings saved successfully."
      );
    } catch (err: any) {
      Alert.alert(
        "Save Failed",
        err?.message || "Failed to save workplace."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color="#2563eb"
          />

          <Text style={styles.loadingText}>
            Loading workplace...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>
                Workplace
              </Text>

              <Text style={styles.subtitle}>
                Configure the attendance location
              </Text>
            </View>

            <Pressable
              style={styles.backButton}
              onPress={() =>
                router.replace("/admin/dashboard")
              }
            >
              <Text style={styles.backButtonText}>
                Back
              </Text>
            </Pressable>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>
                {error}
              </Text>

              <Pressable
                onPress={loadWorkplace}
                style={styles.retryButton}
              >
                <Text style={styles.retryText}>
                  Retry
                </Text>
              </Pressable>
            </View>
          ) : null}

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Workplace Details
            </Text>

            <Text style={styles.label}>
              Workplace Name
            </Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Main Office"
              placeholderTextColor="#94a3b8"
              style={styles.input}
            />

            <View style={styles.locationHeader}>
              <Text style={styles.locationTitle}>
                Workplace Location
              </Text>

              <Text style={styles.locationSubtitle}>
                Set coordinates manually or use your current GPS location.
              </Text>
            </View>

            <Pressable
              style={[
                styles.locationButton,
                locating && styles.disabledButton,
              ]}
              onPress={handleUseCurrentLocation}
              disabled={locating || saving}
            >
              {locating ? (
                <ActivityIndicator color="#2563eb" />
              ) : (
                <>
                  <Text style={styles.locationIcon}>
                    📍
                  </Text>

                  <Text style={styles.locationButtonText}>
                    Use Current Location
                  </Text>
                </>
              )}
            </Pressable>

            <Text style={styles.label}>
              Latitude
            </Text>

            <TextInput
              value={latitude}
              onChangeText={setLatitude}
              placeholder="e.g. 28.6139"
              placeholderTextColor="#94a3b8"
              keyboardType="decimal-pad"
              style={styles.input}
            />

            <Text style={styles.label}>
              Longitude
            </Text>

            <TextInput
              value={longitude}
              onChangeText={setLongitude}
              placeholder="e.g. 77.2090"
              placeholderTextColor="#94a3b8"
              keyboardType="decimal-pad"
              style={styles.input}
            />

            <Text style={styles.label}>
              Allowed Radius (meters)
            </Text>

            <TextInput
              value={radiusMeters}
              onChangeText={setRadiusMeters}
              placeholder="e.g. 50"
              placeholderTextColor="#94a3b8"
              keyboardType="decimal-pad"
              style={styles.input}
            />

            <Text style={styles.label}>
              Maximum Session (hours)
            </Text>

            <TextInput
              value={maximumSessionHours}
              onChangeText={setMaximumSessionHours}
              placeholder="e.g. 12"
              placeholderTextColor="#94a3b8"
              keyboardType="decimal-pad"
              style={styles.input}
            />

            <View style={styles.switchRow}>
              <View style={styles.switchTextContainer}>
                <Text style={styles.switchTitle}>
                  Workplace Active
                </Text>

                <Text style={styles.switchSubtitle}>
                  Employees can mark attendance when active.
                </Text>
              </View>

              <Switch
                value={isActive}
                onValueChange={setIsActive}
              />
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>
              Geofencing
            </Text>

            <Text style={styles.infoText}>
              Employees must be within the configured
              radius of these coordinates to mark
              attendance without providing an
              outside-range reason.
            </Text>
          </View>

          <Pressable
            style={[
              styles.saveButton,
              saving && styles.disabledButton,
            ]}
            onPress={handleSave}
            disabled={saving || locating}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.saveButtonText}>
                {exists
                  ? "Save Changes"
                  : "Create Workplace"}
              </Text>
            )}
          </Pressable>
        </ScrollView>
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
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0f172a",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#64748b",
  },

  backButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
  },

  backButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 18,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 7,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#0f172a",
    backgroundColor: "#ffffff",
    marginBottom: 16,
  },

  locationHeader: {
    marginBottom: 12,
  },

  locationTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },

  locationSubtitle: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: "#64748b",
  },

  locationButton: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#93c5fd",
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 18,
  },

  locationIcon: {
    fontSize: 18,
    marginRight: 7,
  },

  locationButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563eb",
  },

  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },

  switchTextContainer: {
    flex: 1,
    paddingRight: 16,
  },

  switchTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
  },

  switchSubtitle: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 18,
    color: "#64748b",
  },

  infoCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e40af",
    marginBottom: 6,
  },

  infoText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#475569",
  },

  saveButton: {
    height: 50,
    marginTop: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
  },

  disabledButton: {
    opacity: 0.7,
  },

  saveButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },

  errorBox: {
    marginBottom: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },

  errorText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#b91c1c",
  },

  retryButton: {
    marginTop: 10,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 7,
    backgroundColor: "#fee2e2",
  },

  retryText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#991b1b",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#64748b",
  },
});