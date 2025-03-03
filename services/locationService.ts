// services/locationService.ts
import * as Location from "expo-location";
import { Position } from "../types";
import { SEARCH_ZONE_RADIUS } from "../utils/constants";

// Typ för subscription cleanup
type Unsubscribe = () => void;

// Begär platstillstånd
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("Error requesting location permission:", error);
    return false;
  }
};

// Hämta nuvarande position
export const getCurrentLocation = async (): Promise<Position | null> => {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      console.log("Location permission not granted");
      return null;
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.BestForNavigation,
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      timestamp: position.timestamp,
    };
  } catch (error) {
    console.error("Error getting current location:", error);
    return null;
  }
};

// Övervaka användarens position
export const watchUserLocation = async (
  callback: (location: Position) => void
): Promise<Unsubscribe> => {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      console.log("Location permission not granted");
      throw new Error("No location permission");
    }

    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 1,
      },
      (position) => {
        const newPosition: Position = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: position.timestamp,
        };
        callback(newPosition);
      }
    );

    return () => subscription.remove();
  } catch (error) {
    console.error("Error watching user location:", error);
    return () => {};
  }
};
