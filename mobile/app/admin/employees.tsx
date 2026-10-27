import {
  ActivityIndicator,
  Alert,
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

  const [employees, setEmployees] = useState<
    AdminEmployee[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

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

  const handleStatusChange = (
    employee: AdminEmployee
  ) => {
    const nextStatus = !employee.isActive;

    Alert.alert(
      nextStatus
        ? "Activate Employee"
        : "Deactivate Employee",
      `Are you sure you want to ${
        nextStatus ? "activate" : "deactivate"
      } ${employee.employeeId}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: nextStatus
            ? "Activate"
            : "Deactivate",
          style: nextStatus
            ? "default"
            : "destructive",
          onPress: async () => {
            if (!token) {
              return;
            }

            try {
              const response =
                await updateEmployeeStatus(
                  token,
                  employee.employeeId,
                  nextStatus
                );

              setEmployees((current) =>
                current.map((item) =>
                  item.employeeId ===
                  employee.employeeId
                    ? response.employee
                    : item
                )
              );
            } catch (err: any) {
              Alert.alert(
                "Update Failed",
                err?.message ||
                  "Failed to update employee status."
              );
            }
          },
        },
      ]
    );
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
            Loading employees...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>
              Employees
            </Text>

            <Text style={styles.subtitle}>
              {employees.length} employee
              {employees.length === 1 ? "" : "s"}
            </Text>
          </View>

          <Pressable
            style={styles.addButton}
            onPress={() =>
              router.push("/admin/employee")
            }
          >
            <Text style={styles.addButtonText}>
              + Add
            </Text>
          </Pressable>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              {error}
            </Text>

            <Pressable
              style={styles.retryButton}
              onPress={() => loadEmployees()}
            >
              <Text style={styles.retryText}>
                Retry
              </Text>
            </Pressable>
          </View>
        ) : null}

        {employees.length === 0 ? (
          <ScrollView
            contentContainerStyle={styles.emptyContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadEmployees(true)}
              />
            }
          >
            <Text style={styles.emptyTitle}>
              No employees
            </Text>

            <Text style={styles.emptyText}>
              Add your first employee to start managing
              attendance.
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
          </ScrollView>
        ) : (
          <ScrollView
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadEmployees(true)}
              />
            }
          >
            {employees.map((employee) => (
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
                  <View style={styles.employeeInfo}>
                    <Text style={styles.employeeId}>
                      {employee.employeeId}
                    </Text>

                    <Text style={styles.employeeName}>
                      {employee.name}
                    </Text>

                    <Text style={styles.createdAt}>
                      Added{" "}
                      {new Date(
                        employee.createdAt
                      ).toLocaleDateString("en-IN")}
                    </Text>
                  </View>

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
                </Pressable>

                <View style={styles.cardFooter}>
                  <Pressable
                    style={styles.viewButton}
                    onPress={() =>
                      router.push({
                        pathname:
                          "/admin/employee",
                        params: {
                          employeeId:
                            employee.employeeId,
                        },
                      })
                    }
                  >
                    <Text style={styles.viewButtonText}>
                      View Details
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.statusButton,
                      employee.isActive
                        ? styles.deactivateButton
                        : styles.activateButton,
                    ]}
                    onPress={() =>
                      handleStatusChange(employee)
                    }
                  >
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
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  container: {
    flex: 1,
    padding: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  headerContent: {
    flex: 1,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0f172a",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748b",
  },

  addButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 9,
    backgroundColor: "#2563eb",
  },

  addButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },

  list: {
    paddingBottom: 30,
  },

  employeeCard: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  employeeMain: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  employeeInfo: {
    flex: 1,
    paddingRight: 10,
  },

  employeeId: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },

  employeeName: {
    marginTop: 4,
    fontSize: 14,
    color: "#334155",
  },

  createdAt: {
    marginTop: 5,
    fontSize: 11,
    color: "#94a3b8",
  },

  statusBadge: {
    paddingHorizontal: 9,
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
    fontSize: 11,
    fontWeight: "700",
  },

  activeText: {
    color: "#166534",
  },

  inactiveText: {
    color: "#64748b",
  },

  cardFooter: {
    flexDirection: "row",
    gap: 10,
    marginTop: 15,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },

  viewButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: "#eff6ff",
  },

  viewButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563eb",
  },

  statusButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 9,
    borderRadius: 8,
  },

  activateButton: {
    backgroundColor: "#dcfce7",
  },

  deactivateButton: {
    backgroundColor: "#fee2e2",
  },

  statusButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },

  activateText: {
    color: "#166534",
  },

  deactivateText: {
    color: "#b91c1c",
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
    color: "#b91c1c",
  },

  retryButton: {
    alignSelf: "flex-start",
    marginTop: 10,
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

  emptyContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },

  emptyText: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    color: "#64748b",
  },

  emptyButton: {
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 9,
    backgroundColor: "#2563eb",
  },

  emptyButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#64748b",
  },
});