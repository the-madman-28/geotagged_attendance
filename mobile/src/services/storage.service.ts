import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "employee_jwt";
const EMPLOYEE_KEY = "employee_data";

export async function saveAuthData(
  token: string,
  employee: unknown
) {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, token],
    [EMPLOYEE_KEY, JSON.stringify(employee)],
  ]);
}

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function getStoredEmployee<T>() {
  const employee = await AsyncStorage.getItem(
    EMPLOYEE_KEY
  );

  if (!employee) {
    return null;
  }

  return JSON.parse(employee) as T;
}

export async function clearAuthData() {
  await AsyncStorage.multiRemove([
    TOKEN_KEY,
    EMPLOYEE_KEY,
  ]);
}