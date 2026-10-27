import AsyncStorage from "@react-native-async-storage/async-storage";

const ADMIN_TOKEN_KEY = "@geotagged_attendance/admin_token";
const ADMIN_KEY = "@geotagged_attendance/admin";

export async function saveAdminAuth(
  token: string,
  admin: unknown
): Promise<void> {
  await AsyncStorage.multiSet([
    [ADMIN_TOKEN_KEY, token],
    [ADMIN_KEY, JSON.stringify(admin)],
  ]);
}

export async function getAdminToken(): Promise<string | null> {
  return AsyncStorage.getItem(ADMIN_TOKEN_KEY);
}

export async function getStoredAdmin<T>(): Promise<T | null> {
  const value = await AsyncStorage.getItem(ADMIN_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export async function clearAdminAuth(): Promise<void> {
  await AsyncStorage.multiRemove([
    ADMIN_TOKEN_KEY,
    ADMIN_KEY,
  ]);
}