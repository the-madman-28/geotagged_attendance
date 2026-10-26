import { calculateDistance } from "./geolocation";

const workplaceLatitude = 28.6139;
const workplaceLongitude = 77.2090;

// Same location
const sameLocation = calculateDistance(
  workplaceLatitude,
  workplaceLongitude,
  workplaceLatitude,
  workplaceLongitude
);

console.log("Same location:", sameLocation, "meters");

// Approximately nearby location
const nearbyLocation = calculateDistance(
  workplaceLatitude,
  workplaceLongitude,
  28.6141,
  77.2090
);

console.log("Nearby location:", nearbyLocation, "meters");

// Clearly farther away
const farLocation = calculateDistance(
  workplaceLatitude,
  workplaceLongitude,
  28.6200,
  77.2090
);

console.log("Far location:", farLocation, "meters");

const outsideLocation = calculateDistance(
  28.6139,
  77.2090,
  28.6200,
  77.2090
);

console.log("Outside workplace:", outsideLocation, "meters");

console.log(
  "Geofence result:",
  outsideLocation <= 50 ? "IN_RANGE" : "OUT_OF_RANGE"
);