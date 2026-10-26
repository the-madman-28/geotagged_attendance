import * as Location from "expo-location";

export interface CurrentLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export async function getCurrentLocation(): Promise<CurrentLocation> {
  const { status } =
    await Location.requestForegroundPermissionsAsync();

  if (
    status !== Location.PermissionStatus.GRANTED
  ) {
    throw new Error(
      "Location permission is required to mark attendance."
    );
  }

  const location =
    await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

  const {
    latitude,
    longitude,
    accuracy,
  } = location.coords;

  if (accuracy === null) {
    throw new Error(
      "Unable to determine GPS accuracy. Please try again."
    );
  }

  return {
    latitude,
    longitude,
    accuracy,
  };
}