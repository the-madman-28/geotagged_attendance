import {
  ActivityIndicator,
  Alert,
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
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import {
  AdminEmployee,
  createEmployee,
  getEmployee,
} from "../../src/api/admin";
import { useAdminAuth } from "../../src/context/AdminAuthContext";

export default function AdminEmployeeScreen() {
  const { token } = useAdminAuth();

  const params = useLocalSearchParams<{
    employeeId?: string;
  }>();

  const employeeId =
    typeof params.employeeId === "string"
      ? params.employeeId
      : undefined;

  const isEditMode = Boolean(employeeId);

  const [employee, setEmployee] =
    useState<AdminEmployee | null>(null);

  const [idInput, setIdInput] = useState(
    employeeId || ""
  );

  const [nameInput, setNameInput] = useState("");

  const [loading, setLoading] = useState(
    isEditMode
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditMode || !token || !employeeId) {
      setLoading(false);
      return;
    }

    const loadEmployee = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getEmployee(
          token,
          employeeId
        );

        setEmployee(response.employee);
        setIdInput(response.employee.employeeId);
        setNameInput(response.employee.name);
      } catch (err: any) {
        setError(
          err?.message ||
            "Failed to load employee."
        );
      } finally {
        setLoading(false);
      }
    };

    loadEmployee();
  }, [isEditMode, token, employeeId]);

  const handleCreate = async () => {
    if (!token) {
      return;
    }

    const trimmedId = idInput.trim();
    const trimmedName = nameInput.trim();

    if (!trimmedId) {
      Alert.alert(
        "Validation Error",
        "Please enter an employee ID."
      );
      return;
    }

    if (!trimmedName) {
      Alert.alert(
        "Validation Error",
        "Please enter the employee name."
      );
      return;
    }

    try {
      setSaving(true);

      await createEmployee(token, {
        employeeId: trimmedId,
        name: trimmedName,
      });

      Alert.alert(
        "Employee Created",
        "Employee was created successfully.",
        [
          {
            text: "OK",
            onPress: () =>
              router.replace("/admin/employees"),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert(
        "Create Failed",
        err?.message ||
          "Failed to create employee."
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
            Loading employee...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isEditMode && !employee) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.errorTitle}>
            Unable to load employee
          </Text>

          <Text style={styles.errorText}>
            {error || "Employee not found."}
          </Text>

          <Pressable
            style={styles.backPrimaryButton}
            onPress={() =>
              router.replace("/admin/employees")
            }
          >
            <Text style={styles.backPrimaryText}>
              Back to Employees
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (isEditMode && employee) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.container}
        >
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>
                Employee Details
              </Text>

              <Text style={styles.subtitle}>
                View employee information
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

          <View style={styles.card}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                Employee ID
              </Text>

              <Text style={styles.detailValue}>
                {employee.employeeId}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                Name
              </Text>

              <Text style={styles.detailValue}>
                {employee.name}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                Status
              </Text>

              <View
                style={[
                  styles.statusBadge,
                  employee.isActive
                    ? styles.activeBadge
                    : styles.inactiveBadge,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    employee.isActive
                      ? styles.activeText
                      : styles.inactiveText,
                  ]}
                >
                  {employee.isActive
                    ? "Active"
                    : "Inactive"}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                Created
              </Text>

              <Text style={styles.detailValue}>
                {new Date(
                  employee.createdAt
                ).toLocaleDateString("en-IN")}
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.attendanceButton}
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
            <Text style={styles.attendanceButtonText}>
              View Attendance
            </Text>
          </Pressable>
        </ScrollView>
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
            <View style={styles.headerContent}>
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

          <View style={styles.card}>
            <Text style={styles.label}>
              Employee ID
            </Text>

            <TextInput
              value={idInput}
              onChangeText={setIdInput}
              placeholder="e.g. EMP005"
              placeholderTextColor="#94a3b8"
              autoCapitalize="characters"
              style={styles.input}
            />

            <Text style={styles.label}>
              Employee Name
            </Text>

            <TextInput
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="e.g. Rahul Kumar"
              placeholderTextColor="#94a3b8"
              style={styles.input}
            />
          </View>

          <Pressable
            style={[
              styles.saveButton,
              saving && styles.disabledButton,
            ]}
            onPress={handleCreate}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.saveButtonText}>
                Create Employee
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

  headerContent: {
    flex: 1,
    paddingRight: 12,
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
    marginBottom: 18,
  },

  detailRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },

  detailLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 5,
  },

  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },

  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },

  activeBadge: {
    backgroundColor: "#dcfce7",
  },

  inactiveBadge: {
    backgroundColor: "#f1f5f9",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },

  activeText: {
    color: "#166534",
  },

  inactiveText: {
    color: "#64748b",
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

  attendanceButton: {
    height: 50,
    marginTop: 18,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },

  attendanceButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563eb",
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

  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#991b1b",
    textAlign: "center",
  },

  errorText: {
    marginTop: 6,
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
  },

  backPrimaryButton: {
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 9,
    backgroundColor: "#2563eb",
  },

  backPrimaryText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
});