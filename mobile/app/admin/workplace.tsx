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
          err?.message ||
            "Failed to load workplace."
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
        "Your current GPS location has been set as the workplace coordinates."
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
        "Workplace Name Required",
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
        "Invalid Latitude",
        "Please enter a valid latitude between -90 and 90."
      );
      return;
    }

    if (
      !Number.isFinite(longitudeValue) ||
      longitudeValue < -180 ||
      longitudeValue > 180
    ) {
      Alert.alert(
        "Invalid Longitude",
        "Please enter a valid longitude between -180 and 180."
      );
      return;
    }

    if (
      !Number.isFinite(radiusValue) ||
      radiusValue <= 0
    ) {
      Alert.alert(
        "Invalid Radius",
        "Radius must be greater than 0 meters."
      );
      return;
    }

    if (
      !Number.isFinite(sessionHoursValue) ||
      sessionHoursValue <= 0
    ) {
      Alert.alert(
        "Invalid Session Duration",
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
        "Settings Saved",
        "Workplace settings have been saved successfully."
      );
    } catch (err: any) {
      Alert.alert(
        "Save Failed",
        err?.message ||
          "Failed to save workplace settings."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <View style={styles.loadingIcon}>
            <ActivityIndicator
              size="small"
              color="#2563EB"
            />
          </View>

          <Text style={styles.loadingTitle}>
            Loading workplace
          </Text>

          <Text style={styles.loadingText}>
            Fetching your attendance location settings...
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
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.container}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Pressable
                style={styles.backCircle}
                onPress={() =>
                  router.replace("/admin/dashboard")
                }
              >
                <Text style={styles.backArrow}>
                  ‹
                </Text>
              </Pressable>

              <View style={styles.headerText}>
                <Text style={styles.eyebrow}>
                  ADMIN SETTINGS
                </Text>

                <Text style={styles.title}>
                  Workplace
                </Text>

                <Text style={styles.subtitle}>
                  Configure the attendance location
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.headerStatus,
                isActive
                  ? styles.headerStatusActive
                  : styles.headerStatusInactive,
              ]}
            >
              <View
                style={[
                  styles.headerStatusDot,
                  isActive
                    ? styles.headerStatusDotActive
                    : styles.headerStatusDotInactive,
                ]}
              />

              <Text
                style={[
                  styles.headerStatusText,
                  isActive
                    ? styles.headerStatusTextActive
                    : styles.headerStatusTextInactive,
                ]}
              >
                {isActive ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>

          {/* Error */}
          {error ? (
            <View style={styles.errorBox}>
              <View style={styles.errorIcon}>
                <Text style={styles.errorIconText}>
                  !
                </Text>
              </View>

              <View style={styles.errorContent}>
                <Text style={styles.errorTitle}>
                  Unable to load workplace
                </Text>

                <Text style={styles.errorText}>
                  {error}
                </Text>

                <Pressable
                  onPress={loadWorkplace}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryText}>
                    Try Again
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {/* Overview */}
          <View style={styles.overviewCard}>
            <View style={styles.overviewIcon}>
              <Text style={styles.overviewIconText}>
                ◎
              </Text>
            </View>

            <View style={styles.overviewContent}>
              <Text style={styles.overviewTitle}>
                Attendance Zone
              </Text>

              <Text style={styles.overviewText}>
                Employees can punch in and out based on
                their distance from this configured workplace.
              </Text>
            </View>
          </View>

          {/* Workplace details */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Workplace Details
            </Text>

            <Text style={styles.sectionSubtitle}>
              Configure the attendance zone and rules
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>
              Workplace Name
            </Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Main Office"
              placeholderTextColor="#94A3B8"
              autoCapitalize="words"
              autoCorrect={false}
              style={styles.input}
            />

            {/* Location */}
            <View style={styles.subsectionHeader}>
              <View style={styles.subsectionIcon}>
                <Text style={styles.subsectionIconText}>
                  GPS
                </Text>
              </View>

              <View style={styles.subsectionContent}>
                <Text style={styles.subsectionTitle}>
                  Workplace Location
                </Text>

                <Text style={styles.subsectionSubtitle}>
                  Set the exact coordinates used for geofencing.
                </Text>
              </View>
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
                <>
                  <ActivityIndicator
                    color="#2563EB"
                    size="small"
                  />

                  <Text style={styles.locationButtonText}>
                    Capturing Location...
                  </Text>
                </>
              ) : (
                <>
                  <View style={styles.locationButtonIcon}>
                    <Text
                      style={
                        styles.locationButtonIconText
                      }
                    >
                      ⌖
                    </Text>
                  </View>

                  <View>
                    <Text
                      style={styles.locationButtonText}
                    >
                      Use Current Location
                    </Text>

                    <Text
                      style={styles.locationButtonHint}
                    >
                      Automatically fill GPS coordinates
                    </Text>
                  </View>
                </>
              )}
            </Pressable>

            <View style={styles.coordinateRow}>
              <View style={styles.coordinateField}>
                <Text style={styles.label}>
                  Latitude
                </Text>

                <TextInput
                  value={latitude}
                  onChangeText={setLatitude}
                  placeholder="28.6139"
                  placeholderTextColor="#94A3B8"
                  keyboardType="decimal-pad"
                  style={styles.input}
                />
              </View>

              <View
                style={[
                  styles.coordinateField,
                  styles.coordinateFieldRight,
                ]}
              >
                <Text style={styles.label}>
                  Longitude
                </Text>

                <TextInput
                  value={longitude}
                  onChangeText={setLongitude}
                  placeholder="77.2090"
                  placeholderTextColor="#94A3B8"
                  keyboardType="decimal-pad"
                  style={styles.input}
                />
              </View>
            </View>

            {/* Geofence */}
            <View style={styles.subsectionHeader}>
              <View style={styles.subsectionIcon}>
                <Text style={styles.subsectionIconText}>
                  GEO
                </Text>
              </View>

              <View style={styles.subsectionContent}>
                <Text style={styles.subsectionTitle}>
                  Geofence Rules
                </Text>

                <Text style={styles.subsectionSubtitle}>
                  Define how close employees need to be.
                </Text>
              </View>
            </View>

            <Text style={styles.label}>
              Allowed Radius
            </Text>

            <View style={styles.inputWithUnit}>
              <TextInput
                value={radiusMeters}
                onChangeText={setRadiusMeters}
                placeholder="50"
                placeholderTextColor="#94A3B8"
                keyboardType="decimal-pad"
                style={styles.unitInput}
              />

              <View style={styles.unitBadge}>
                <Text style={styles.unitText}>
                  METERS
                </Text>
              </View>
            </View>

            <Text style={styles.helperText}>
              Employees inside this radius are considered
              within the workplace.
            </Text>

            <Text style={styles.label}>
              Maximum Session
            </Text>

            <View style={styles.inputWithUnit}>
              <TextInput
                value={maximumSessionHours}
                onChangeText={setMaximumSessionHours}
                placeholder="12"
                placeholderTextColor="#94A3B8"
                keyboardType="decimal-pad"
                style={styles.unitInput}
              />

              <View style={styles.unitBadge}>
                <Text style={styles.unitText}>
                  HOURS
                </Text>
              </View>
            </View>

            <Text style={styles.helperText}>
              An open attendance session will be automatically
              closed after this duration.
            </Text>

            {/* Active */}
            <View style={styles.switchCard}>
              <View style={styles.switchIcon}>
                <View
                  style={[
                    styles.switchDot,
                    isActive
                      ? styles.switchDotActive
                      : styles.switchDotInactive,
                  ]}
                />
              </View>

              <View style={styles.switchTextContainer}>
                <Text style={styles.switchTitle}>
                  Workplace Active
                </Text>

                <Text style={styles.switchSubtitle}>
                  {isActive
                    ? "Employees can currently mark attendance."
                    : "Attendance marking is currently disabled."}
                </Text>
              </View>

              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{
                  false: "#CBD5E1",
                  true: "#93C5FD",
                }}
                thumbColor={
                  isActive
                    ? "#2563EB"
                    : "#F8FAFC"
                }
              />
            </View>
          </View>

          {/* Geofencing explanation */}
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Text style={styles.infoIconText}>
                i
              </Text>
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                How geofencing works
              </Text>

              <Text style={styles.infoText}>
                The employee's GPS coordinates are compared
                with this workplace location. If the employee
                is outside the configured radius, they must
                provide a reason before attendance can be
                recorded.
              </Text>
            </View>
          </View>

          {/* Save */}
          <Pressable
            style={[
              styles.saveButton,
              saving && styles.disabledButton,
            ]}
            onPress={handleSave}
            disabled={saving || locating}
          >
            {saving ? (
              <>
                <ActivityIndicator
                  color="#FFFFFF"
                  size="small"
                />

                <Text style={styles.saveButtonText}>
                  Saving...
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.saveButtonIcon}>
                  ✓
                </Text>

                <Text style={styles.saveButtonText}>
                  {exists
                    ? "Save Changes"
                    : "Create Workplace"}
                </Text>
              </>
            )}
          </Pressable>

          <Text style={styles.footer}>
            © 2026 Made by Madman
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F9FF",
  },

  flex: {
    flex: 1,
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  backCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  backArrow: {
    fontSize: 30,
    lineHeight: 32,
    color: "#1E3A5F",
    fontWeight: "400",
    marginTop: -3,
  },

  headerText: {
    flex: 1,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    color: "#2563EB",
    marginBottom: 2,
  },

  title: {
    fontSize: 25,
    fontWeight: "800",
    color: "#102A56",
  },

  subtitle: {
    marginTop: 2,
    fontSize: 11,
    color: "#718096",
  },

  headerStatus: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
    marginLeft: 8,
  },

  headerStatusActive: {
    backgroundColor: "#E8F8EF",
  },

  headerStatusInactive: {
    backgroundColor: "#F1F5F9",
  },

  headerStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  headerStatusDotActive: {
    backgroundColor: "#16A34A",
  },

  headerStatusDotInactive: {
    backgroundColor: "#94A3B8",
  },

  headerStatusText: {
    fontSize: 10,
    fontWeight: "800",
  },

  headerStatusTextActive: {
    color: "#15803D",
  },

  headerStatusTextInactive: {
    color: "#64748B",
  },

  overviewCard: {
    backgroundColor: "#EAF4FF",
    borderRadius: 20,
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D8EAFB",
    marginBottom: 25,
  },

  overviewIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  overviewIconText: {
    fontSize: 28,
    fontWeight: "500",
    color: "#2563EB",
  },

  overviewContent: {
    flex: 1,
  },

  overviewTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#183B66",
  },

  overviewText: {
    fontSize: 11,
    lineHeight: 16,
    color: "#66809D",
    marginTop: 4,
  },

  sectionHeader: {
    marginBottom: 11,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#183B66",
  },

  sectionSubtitle: {
    fontSize: 12,
    color: "#7A8CA5",
    marginTop: 3,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E7EEF7",
    shadowColor: "#163B67",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
    marginBottom: 18,
  },

  label: {
    fontSize: 12,
    fontWeight: "800",
    color: "#334E6F",
    marginBottom: 8,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#D8E2EF",
    borderRadius: 13,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#183B66",
    backgroundColor: "#FBFDFF",
    marginBottom: 17,
  },

  subsectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 14,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#EEF2F7",
  },

  subsectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F0F6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  subsectionIconText: {
    fontSize: 8,
    fontWeight: "900",
    color: "#2563EB",
  },

  subsectionContent: {
    flex: 1,
  },

  subsectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#183B66",
  },

  subsectionSubtitle: {
    fontSize: 10,
    lineHeight: 15,
    color: "#7A8CA5",
    marginTop: 2,
  },

  locationButton: {
    minHeight: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#BFDDF8",
    backgroundColor: "#F0F7FF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    marginBottom: 18,
  },

  locationButtonIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  locationButtonIconText: {
    fontSize: 21,
    color: "#2563EB",
    fontWeight: "700",
  },

  locationButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#2563EB",
  },

  locationButtonHint: {
    fontSize: 10,
    color: "#7890AA",
    marginTop: 2,
  },

  coordinateRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  coordinateField: {
    flex: 1,
  },

  coordinateFieldRight: {
    marginLeft: 10,
  },

  inputWithUnit: {
    height: 50,
    borderWidth: 1,
    borderColor: "#D8E2EF",
    borderRadius: 13,
    backgroundColor: "#FBFDFF",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 14,
    paddingRight: 7,
  },

  unitInput: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    color: "#183B66",
  },

  unitBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#EEF4FA",
  },

  unitText: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.5,
    color: "#64748B",
  },

  helperText: {
    fontSize: 10,
    color: "#8A9AB0",
    lineHeight: 15,
    marginTop: 6,
    marginBottom: 17,
  },

  switchCard: {
    marginTop: 5,
    padding: 13,
    borderRadius: 15,
    backgroundColor: "#F8FAFD",
    borderWidth: 1,
    borderColor: "#E8EEF5",
    flexDirection: "row",
    alignItems: "center",
  },

  switchIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  switchDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  switchDotActive: {
    backgroundColor: "#22C55E",
  },

  switchDotInactive: {
    backgroundColor: "#94A3B8",
  },

  switchTextContainer: {
    flex: 1,
    paddingRight: 10,
  },

  switchTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#183B66",
  },

  switchSubtitle: {
    fontSize: 10,
    lineHeight: 15,
    color: "#7A8CA5",
    marginTop: 2,
  },

  infoCard: {
    marginBottom: 18,
    padding: 15,
    borderRadius: 17,
    backgroundColor: "#F0F7FF",
    borderWidth: 1,
    borderColor: "#DCECFB",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  infoIconText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#2563EB",
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#183B66",
    marginBottom: 4,
  },

  infoText: {
    fontSize: 10,
    lineHeight: 16,
    color: "#6B819B",
  },

  saveButton: {
    height: 54,
    borderRadius: 15,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#2563EB",
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },

  saveButtonIcon: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
    marginRight: 8,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  disabledButton: {
    opacity: 0.65,
  },

  errorBox: {
    marginBottom: 18,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  errorIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  errorIconText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#DC2626",
  },

  errorContent: {
    flex: 1,
  },

  errorTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#991B1B",
    marginBottom: 3,
  },

  errorText: {
    fontSize: 11,
    lineHeight: 16,
    color: "#B91C1C",
  },

  retryButton: {
    alignSelf: "flex-start",
    marginTop: 9,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: "#FEE2E2",
  },

  retryText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#991B1B",
  },

  loadingIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#EAF4FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  loadingTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#183B66",
  },

  loadingText: {
    marginTop: 5,
    fontSize: 11,
    color: "#7A8CA5",
    textAlign: "center",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  footer: {
    textAlign: "center",
    fontSize: 10,
    color: "#8A9AB0",
    fontWeight: "500",
    marginTop: 20,
  },
});