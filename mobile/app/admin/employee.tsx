import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { useCallback, useState } from "react";

import {
  createEmployee,
  getEmployee,
} from "../../src/api/admin";
import { useAdminAuth } from "../../src/context/AdminAuthContext";

function formatDate(value?: string | null): string {
  if (!value) {
    return "--";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminEmployeeScreen() {
  const { token } = useAdminAuth();

  const params = useLocalSearchParams<{
    employeeId?: string;
  }>();

  const employeeId =
    typeof params.employeeId === "string"
      ? params.employeeId
      : undefined;

  const isCreateMode = !employeeId;

  const [name, setName] = useState("");
  const [newEmployeeId, setNewEmployeeId] =
    useState("");

  const [employee, setEmployee] =
    useState<any>(null);

  const [loading, setLoading] = useState(
    !isCreateMode
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadEmployee = useCallback(async () => {
    if (!token || !employeeId) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getEmployee(
        token,
        employeeId
      );

      setEmployee(response.employee);
    } catch (err: any) {
      setError(
        err?.message ||
          "Failed to load employee."
      );
    } finally {
      setLoading(false);
    }
  }, [token, employeeId]);

  useFocusEffect(
    useCallback(() => {
      if (!isCreateMode) {
        loadEmployee();
      }
    }, [isCreateMode, loadEmployee])
  );

  async function handleCreate() {
    if (!token) {
      return;
    }

    const trimmedId =
      newEmployeeId.trim();

    const trimmedName =
      name.trim();

    if (!trimmedId) {
      setError("Employee ID is required.");
      return;
    }

    if (!trimmedName) {
      setError("Employee name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await createEmployee(token, {
        employeeId: trimmedId,
        name: trimmedName,
      });

      router.replace({
        pathname: "/admin/employee",
        params: {
          employeeId: trimmedId,
        },
      });
    } catch (err: any) {
      setError(
        err?.message ||
          "Failed to create employee."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingScreen}>
          <View style={styles.loadingIcon}>
            <ActivityIndicator
              size="large"
              color="#2563EB"
            />
          </View>

          <Text style={styles.loadingTitle}>
            Loading employee
          </Text>

          <Text style={styles.loadingSubtitle}>
            Fetching employee information...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /* ================= CREATE MODE ================= */

  if (isCreateMode) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.eyebrow}>
                ADMIN PORTAL
              </Text>

              <Text style={styles.title}>
                Add Employee
              </Text>

              <Text style={styles.subtitle}>
                Create a new employee account
              </Text>
            </View>

            <Pressable
              style={styles.backButton}
              onPress={() =>
                router.replace("/admin/employees")
              }
            >
              <Text style={styles.backButtonText}>
                Back
              </Text>
            </Pressable>
          </View>

          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <View style={styles.formIcon}>
                <Text style={styles.formIconText}>
                  +
                </Text>
              </View>

              <View style={styles.formHeaderText}>
                <Text style={styles.formTitle}>
                  Employee details
                </Text>

                <Text style={styles.formSubtitle}>
                  Enter the basic information for the
                  employee.
                </Text>
              </View>
            </View>

            <View style={styles.separator} />

            <Text style={styles.inputLabel}>
              EMPLOYEE ID
            </Text>

            <TextInput
              value={newEmployeeId}
              onChangeText={setNewEmployeeId}
              placeholder="e.g. EMP005"
              placeholderTextColor="#A0AEC0"
              autoCapitalize="characters"
              style={styles.input}
              editable={!saving}
            />

            <Text style={styles.inputHint}>
              This ID will be used by the employee to
              access the mobile attendance app.
            </Text>

            <Text style={styles.inputLabel}>
              FULL NAME
            </Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter employee name"
              placeholderTextColor="#A0AEC0"
              autoCapitalize="words"
              style={styles.input}
              editable={!saving}
            />

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorTitle}>
                  Unable to create employee
                </Text>

                <Text style={styles.errorText}>
                  {error}
                </Text>
              </View>
            ) : null}

            <Pressable
              style={[
                styles.primaryButton,
                saving &&
                  styles.disabledButton,
              ]}
              disabled={saving}
              onPress={handleCreate}
            >
              {saving ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Text style={styles.primaryButtonText}>
                  Create Employee
                </Text>
              )}
            </Pressable>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Text style={styles.infoIconText}>
                i
              </Text>
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                Employee access
              </Text>

              <Text style={styles.infoText}>
                Employees sign in to the mobile app
                using their Employee ID. No employee
                password is required.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* ================= DETAIL MODE ================= */

  if (!employee) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyScreen}>
          <Text style={styles.emptyTitle}>
            Employee not found
          </Text>

          <Text style={styles.emptyText}>
            The requested employee could not be loaded.
          </Text>

          <Pressable
            style={styles.primaryButton}
            onPress={() =>
              router.replace("/admin/employees")
            }
          >
            <Text style={styles.primaryButtonText}>
              Back to Employees
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>
              EMPLOYEE PROFILE
            </Text>

            <Text style={styles.title}>
              Employee
            </Text>

            <Text style={styles.subtitle}>
              View employee information and attendance
            </Text>
          </View>

          <Pressable
            style={styles.backButton}
            onPress={() =>
              router.replace("/admin/employees")
            }
          >
            <Text style={styles.backButtonText}>
              Back
            </Text>
          </Pressable>
        </View>

        {/* Profile Hero */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {employee.name
                ?.charAt(0)
                .toUpperCase() || "E"}
            </Text>
          </View>

          <Text style={styles.profileName}>
            {employee.name}
          </Text>

          <Text style={styles.profileId}>
            {employee.employeeId}
          </Text>

          <View style={styles.profileStatus}>
            <View
              style={[
                styles.profileStatusDot,
                employee.isActive
                  ? styles.activeDot
                  : styles.inactiveDot,
              ]}
            />

            <Text
              style={[
                styles.profileStatusText,
                employee.isActive
                  ? styles.activeText
                  : styles.inactiveText,
              ]}
            >
              {employee.isActive
                ? "Active employee"
                : "Inactive employee"}
            </Text>
          </View>
        </View>

        {/* Information */}
        <View style={styles.detailCard}>
          <Text style={styles.sectionLabel}>
            EMPLOYEE INFORMATION
          </Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Employee ID
            </Text>

            <Text style={styles.detailValue}>
              {employee.employeeId}
            </Text>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Name
            </Text>

            <Text style={styles.detailValue}>
              {employee.name}
            </Text>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Account Status
            </Text>

            <Text
              style={[
                styles.detailValue,
                employee.isActive
                  ? styles.successValue
                  : styles.inactiveValue,
              ]}
            >
              {employee.isActive
                ? "Active"
                : "Inactive"}
            </Text>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Created
            </Text>

            <Text style={styles.detailValue}>
              {formatDate(employee.createdAt)}
            </Text>
          </View>
        </View>

        {/* Attendance */}
        <View style={styles.attendanceCard}>
          <View style={styles.attendanceHeader}>
            <View style={styles.attendanceIcon}>
              <Text style={styles.attendanceIconText}>
                ✓
              </Text>
            </View>

            <View style={styles.attendanceHeaderText}>
              <Text style={styles.attendanceTitle}>
                Attendance
              </Text>

              <Text style={styles.attendanceSubtitle}>
                View the complete attendance history
                for this employee.
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.secondaryButton}
            onPress={() =>
              router.push({
                pathname: "/admin/attendance",
                params: {
                  employeeId:
                    employee.employeeId,
                },
              })
            }
          >
            <Text style={styles.secondaryButtonText}>
              View Attendance
            </Text>

            <Text style={styles.secondaryArrow}>
              →
            </Text>
          </Pressable>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>
              Unable to load employee
            </Text>

            <Text style={styles.errorText}>
              {error}
            </Text>
          </View>
        ) : null}

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7FAFC",
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    paddingBottom: 20,
  },

  headerText: {
    flex: 1,
    paddingRight: 12,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#2563EB",
    marginBottom: 2,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#102A56",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 12,
    color: "#718096",
  },

  backButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE5F0",
  },

  backButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },

  /* ================= FORM ================= */

  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#E1E8F0",
    padding: 18,
  },

  formHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  formIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  formIconText: {
    fontSize: 23,
    fontWeight: "500",
    color: "#2563EB",
  },

  formHeaderText: {
    flex: 1,
  },

  formTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#102A56",
  },

  formSubtitle: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    color: "#718096",
  },

  separator: {
    height: 1,
    backgroundColor: "#EDF1F5",
    marginVertical: 18,
  },

  inputLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: "#718096",
    marginBottom: 7,
  },

  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DCE5F0",
    backgroundColor: "#FAFCFF",
    paddingHorizontal: 13,
    fontSize: 14,
    color: "#1E293B",
    marginBottom: 6,
  },

  inputHint: {
    fontSize: 10,
    lineHeight: 15,
    color: "#94A3B8",
    marginBottom: 17,
  },

  primaryButton: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    marginTop: 17,
  },

  primaryButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  disabledButton: {
    opacity: 0.7,
  },

  /* ================= INFO ================= */

  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 12,
    padding: 14,
    borderRadius: 15,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },

  infoIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  infoIconText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#2563EB",
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1E40AF",
    marginBottom: 3,
  },

  infoText: {
    fontSize: 11,
    lineHeight: 17,
    color: "#3B82F6",
  },

  /* ================= PROFILE ================= */

  profileCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E1E8F0",
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 12,
  },

  profileAvatar: {
    width: 76,
    height: 76,
    borderRadius: 25,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  profileAvatarText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2563EB",
  },

  profileName: {
    fontSize: 21,
    fontWeight: "800",
    color: "#102A56",
  },

  profileId: {
    marginTop: 3,
    fontSize: 12,
    color: "#718096",
  },

  profileStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#F8FAFC",
  },

  profileStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },

  profileStatusText: {
    fontSize: 11,
    fontWeight: "700",
  },

  activeDot: {
    backgroundColor: "#16A34A",
  },

  inactiveDot: {
    backgroundColor: "#94A3B8",
  },

  activeText: {
    color: "#15803D",
  },

  inactiveText: {
    color: "#64748B",
  },

  /* ================= DETAILS ================= */

  detailCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E1E8F0",
    padding: 17,
    marginBottom: 12,
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.9,
    color: "#7C8CA2",
    marginBottom: 8,
  },

  detailRow: {
    minHeight: 43,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  detailLabel: {
    fontSize: 12,
    color: "#718096",
  },

  detailValue: {
    maxWidth: "58%",
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    textAlign: "right",
  },

  successValue: {
    color: "#15803D",
  },

  inactiveValue: {
    color: "#64748B",
  },

  detailDivider: {
    height: 1,
    backgroundColor: "#EDF1F5",
  },

  /* ================= ATTENDANCE ================= */

  attendanceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E1E8F0",
    padding: 17,
  },

  attendanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  attendanceIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  attendanceIconText: {
    fontSize: 19,
    fontWeight: "800",
    color: "#2563EB",
  },

  attendanceHeaderText: {
    flex: 1,
  },

  attendanceTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#102A56",
  },

  attendanceSubtitle: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    color: "#718096",
  },

  secondaryButton: {
    minHeight: 45,
    borderRadius: 11,
    backgroundColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#334155",
  },

  secondaryArrow: {
    marginLeft: 7,
    fontSize: 17,
    color: "#2563EB",
  },

  /* ================= ERROR ================= */

  errorBox: {
    marginTop: 14,
    padding: 13,
    borderRadius: 13,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  errorTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#991B1B",
  },

  errorText: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: "#B91C1C",
  },

  /* ================= EMPTY ================= */

  emptyScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#102A56",
  },

  emptyText: {
    marginTop: 6,
    fontSize: 13,
    color: "#718096",
    textAlign: "center",
  },

  /* ================= LOADING ================= */

  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  loadingIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  loadingTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#102A56",
  },

  loadingSubtitle: {
    marginTop: 5,
    fontSize: 12,
    color: "#8795A8",
  },

  bottomSpace: {
    height: 10,
  },
});