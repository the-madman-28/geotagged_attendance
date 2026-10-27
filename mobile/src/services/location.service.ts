// mobile/src/services/location.service.ts

import * as Location from "expo-location";

export interface CurrentLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export async function getCurrentLocation(): Promise<CurrentLocation> {
  const { status } =
    await Location.requestForegroundPermissionsAsync();

  if (status !== Location.PermissionStatus.GRANTED) {
    throw new Error(
      "Location permission is required. Please allow location access and try again."
    );
  }

  const enabled =
    await Location.hasServicesEnabledAsync();

  if (!enabled) {
    throw new Error(
      "GPS is disabled. Please enable location services and try again."
    );
  }

  let location: Location.LocationObject;

  try {
    location =
      await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
  } catch {
    throw new Error(
      "Unable to get your current location. Please move to an open area and try again."
    );
  }

  const {
    latitude,
    longitude,
    accuracy,
  } = location.coords;

  if (
    typeof accuracy !== "number" ||
    !Number.isFinite(accuracy)
  ) {
    throw new Error(
      "GPS accuracy could not be determined. Please try again."
    );
  }

  return {
    latitude,
    longitude,
    accuracy,
  };
}