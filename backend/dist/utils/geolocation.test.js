"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const geolocation_1 = require("./geolocation");
const workplaceLatitude = 28.6139;
const workplaceLongitude = 77.2090;
// Same location
const sameLocation = (0, geolocation_1.calculateDistance)(workplaceLatitude, workplaceLongitude, workplaceLatitude, workplaceLongitude);
console.log("Same location:", sameLocation, "meters");
// Approximately nearby location
const nearbyLocation = (0, geolocation_1.calculateDistance)(workplaceLatitude, workplaceLongitude, 28.6141, 77.2090);
console.log("Nearby location:", nearbyLocation, "meters");
// Clearly farther away
const farLocation = (0, geolocation_1.calculateDistance)(workplaceLatitude, workplaceLongitude, 28.6200, 77.2090);
console.log("Far location:", farLocation, "meters");
const outsideLocation = (0, geolocation_1.calculateDistance)(28.6139, 77.2090, 28.6200, 77.2090);
console.log("Outside workplace:", outsideLocation, "meters");
console.log("Geofence result:", outsideLocation <= 50 ? "IN_RANGE" : "OUT_OF_RANGE");
