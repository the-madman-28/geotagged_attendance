import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import {
  AdminEmployee,
  getEmployees,
  updateEmployeeStatus,
} from "../../src/api/admin";
import { useAdminAuth } from "../../src/context/AdminAuthContext";

export default function AdminEmployeesScreen() {
  const { token } = useAdminAuth();

  const [employees, setEmployees] = useState<AdminEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(
    null
  );

  const loadEmployees = useCallback(
    async (isRefresh = false) => {
      if (!token) {
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await getEmployees(token);

        setEmployees(response.employees || []);
      } catch (err: any) {
        setError(
          err?.message ||
            "Failed to load employees."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  useFocusEffect(
    useCallback(() => {
      loadEmployees();
    }, [loadEmployees])
  );

  async function handleStatusChange(
    employee: AdminEmployee
  ) {
    if (!token || updatingId) {
      return;
    }

    try {
      setUpdatingId(employee.employeeId);
      setError("");

      await updateEmployeeStatus(
        token,
        employee.employeeId,
        !employee.isActive
      );

      await loadEmployees(true);
    } catch (err: any) {
      setError(
        err?.message ||
          "Failed to update employee status."
      );
    } finally {
      setUpdatingId(null);
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
            Loading employees
          </Text>

          <Text style={styles.loadingSubtitle}>
            Fetching employee records...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>
              ADMIN PORTAL
            </Text>

            <Text style={styles.title}>
              Employees
            </Text>

            <Text style={styles.subtitle}>
              Manage employee accounts and access
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

        {/* Overview */}
        <View style={styles.overviewCard}>
          <View style={styles.overviewLeft}>
            <View style={styles.overviewIcon}>
              <Text style={styles.overviewIconText}>
                E
              </Text>
            </View>

            <View>
              <Text style={styles.overviewLabel}>
                TOTAL EMPLOYEES
              </Text>

              <Text style={styles.overviewCaption}>
                Registered employee accounts
              </Text>
            </View>
          </View>

          <Text style={styles.overviewValue}>
            {employees.length}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <Pressable
            style={styles.addButton}
            onPress={() =>
              router.push("/admin/employee")
            }
          >
            <Text style={styles.addButtonIcon}>
              +
            </Text>

            <Text style={styles.addButtonText}>
              Add Employee
            </Text>
          </Pressable>
        </View>

        {/* Error */}
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>
              Something went wrong
            </Text>

            <Text style={styles.errorText}>
              {error}
            </Text>

            <Pressable
              style={styles.retryButton}
              onPress={() => loadEmployees()}
            >
              <Text style={styles.retryText}>
                Try Again
              </Text>
            </Pressable>
          </View>
        ) : null}

        {/* Employee List */}
        {employees.length === 0 ? (
          <ScrollView
            contentContainerStyle={styles.emptyContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadEmployees(true)}
                tintColor="#2563EB"
              />
            }
          >
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Text style={styles.emptyIconText}>
                  E
                </Text>
              </View>

              <Text style={styles.emptyTitle}>
                No employees yet
              </Text>

              <Text style={styles.emptyText}>
                Create your first employee account to
                start managing attendance.
              </Text>

              <Pressable
                style={styles.emptyButton}
                onPress={() =>
                  router.push("/admin/employee")
                }
              >
                <Text style={styles.emptyButtonText}>
                  Add Employee
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        ) : (
          <ScrollView
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadEmployees(true)}
                tintColor="#2563EB"
              />
            }
          >
            {employees.map((employee) => {
              const isUpdating =
                updatingId === employee.employeeId;

              return (
                <View
                  key={employee.employeeId}
                  style={styles.employeeCard}
                >
                  <Pressable
                    style={styles.employeeMain}
                    onPress={() =>
                      router.push({
                        pathname: "/admin/employee",
                        params: {
                          employeeId:
                            employee.employeeId,
                        },
                      })
                    }
                  >
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {employee.name
                          .charAt(0)
                          .toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.employeeInfo}>
                      <Text style={styles.employeeName}>
                        {employee.name}
                      </Text>

                      <Text style={styles.employeeId}>
                        {employee.employeeId}
                      </Text>

                      <View style={styles.statusRow}>
                        <View
                          style={[
                            styles.statusDot,
                            employee.isActive
                              ? styles.activeDot
                              : styles.inactiveDot,
                          ]}
                        />

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

                    <Text style={styles.chevron}>
                      ›
                    </Text>
                  </Pressable>

                  <View style={styles.employeeFooter}>
                    <Pressable
                      style={styles.attendanceButton}
                      onPress={() =>
                        router.push({
                          pathname:
                            "/admin/attendance",
                          params: {
                            employeeId:
                              employee.employeeId,
                          },
                        })
                      }
                    >
                      <Text
                        style={
                          styles.attendanceButtonText
                        }
                      >
                        View Attendance
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.statusButton,
                        employee.isActive
                          ? styles.deactivateButton
                          : styles.activateButton,
                      ]}
                      disabled={isUpdating}
                      onPress={() =>
                        handleStatusChange(employee)
                      }
                    >
                      {isUpdating ? (
                        <ActivityIndicator
                          size="small"
                          color={
                            employee.isActive
                              ? "#B91C1C"
                              : "#166534"
                          }
                        />
                      ) : (
                        <Text
                          style={[
                            styles.statusButtonText,
                            employee.isActive
                              ? styles.deactivateText
                              : styles.activateText,
                          ]}
                        >
                          {employee.isActive
                            ? "Deactivate"
                            : "Activate"}
                        </Text>
                      )}
                    </Pressable>
                  </View>
                </View>
              );
            })}

            <View style={styles.bottomSpace} />
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7FAFC",
  },

  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#F7FAFC",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    paddingBottom: 18,
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

  overviewCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E8F0",
    marginBottom: 12,
  },

  overviewLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  overviewIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  overviewIconText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#2563EB",
  },

  overviewLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: "#7C8CA2",
  },

  overviewCaption: {
    marginTop: 3,
    fontSize: 11,
    color: "#94A3B8",
  },

  overviewValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#102A56",
  },

  actionsRow: {
    marginBottom: 14,
  },

  addButton: {
    minHeight: 48,
    borderRadius: 13,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },

  addButtonIcon: {
    fontSize: 21,
    lineHeight: 22,
    fontWeight: "500",
    color: "#FFFFFF",
    marginRight: 7,
  },

  addButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  employeeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#E1E8F0",
    marginBottom: 12,
    overflow: "hidden",
  },

  employeeMain: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  avatarText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2563EB",
  },

  employeeInfo: {
    flex: 1,
  },

  employeeName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#102A56",
  },

  employeeId: {
    marginTop: 2,
    fontSize: 12,
    color: "#718096",
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },

  activeDot: {
    backgroundColor: "#16A34A",
  },

  inactiveDot: {
    backgroundColor: "#94A3B8",
  },

  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },

  activeText: {
    color: "#15803D",
  },

  inactiveText: {
    color: "#64748B",
  },

  chevron: {
    fontSize: 28,
    fontWeight: "300",
    color: "#A0AEC0",
    marginLeft: 8,
  },

  employeeFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 15,
    paddingBottom: 14,
  },

  attendanceButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  attendanceButtonText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#334155",
  },

  statusButton: {
    minWidth: 95,
    minHeight: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },

  activateButton: {
    backgroundColor: "#DCFCE7",
  },

  deactivateButton: {
    backgroundColor: "#FEE2E2",
  },

  statusButtonText: {
    fontSize: 11,
    fontWeight: "800",
  },

  activateText: {
    color: "#166534",
  },

  deactivateText: {
    color: "#B91C1C",
  },

  errorBox: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 14,
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

  retryButton: {
    alignSelf: "flex-start",
    marginTop: 9,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: "#FEE2E2",
  },

  retryText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#991B1B",
  },

  emptyContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },

  emptyCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E1E8F0",
    alignItems: "center",
    padding: 28,
  },

  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  emptyIconText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2563EB",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#102A56",
  },

  emptyText: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 19,
    color: "#718096",
    textAlign: "center",
  },

  emptyButton: {
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 11,
    backgroundColor: "#2563EB",
  },

  emptyButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  list: {
    paddingBottom: 30,
  },

  bottomSpace: {
    height: 10,
  },

  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    backgroundColor: "#F7FAFC",
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
});