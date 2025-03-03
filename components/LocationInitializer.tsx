// components/LocationInitializer.tsx
import { useEffect } from "react";
import {
  getCurrentLocation,
  watchUserLocation,
} from "../services/locationService";
import { findSafePoint } from "../services/safePointService";
import { SAFE_ZONE_RADIUS } from "../utils/constants";
import { useLocation } from "../contexts/LocationContext";

interface LocationInitializerProps {
  isInitialized: boolean;
  setIsInitialized: (value: boolean) => void;
}

export default function LocationInitializer({
  isInitialized,
  setIsInitialized,
}: LocationInitializerProps) {
  const { startPosition, setStartPosition, setCurrentPosition, setSafeArea } =
    useLocation();

  console.log("LocationInitializer component rendered");

  useEffect(() => {
    console.log("useEffect triggered in LocationInitializer");
    console.log(
      "isInitialized:",
      isInitialized,
      "startPosition:",
      startPosition
    );

    let unsubscribe: (() => void) | undefined;

    const initialize = async () => {
      console.log("Starting initialization...");
      if (!isInitialized && !startPosition) {
        try {
          console.log("Fetching current location...");
          const initialPosition = await getCurrentLocation();
          if (initialPosition) {
            console.log("Initial position fetched:", initialPosition);
            setStartPosition(initialPosition);
            setCurrentPosition(initialPosition);

            console.log("Finding safe point...");
            const safePoint = await findSafePoint(
              initialPosition.latitude,
              initialPosition.longitude
            );
            if (safePoint) {
              console.log("Safe point found:", safePoint);
              setSafeArea({ safePoint, radius: SAFE_ZONE_RADIUS });
              setIsInitialized(true);
              console.log("Initialization complete!");
            } else {
              console.error("No safe point returned");
            }
          } else {
            console.error(
              "No initial position returned from getCurrentLocation"
            );
          }
        } catch (error) {
          console.error("Error during initialization:", error);
        }
      } else {
        console.log("Already initialized or startPosition exists, skipping...");
      }

      console.log("Starting location watch...");
      try {
        unsubscribe = await watchUserLocation((newPosition) => {
          console.log("New position from watch:", newPosition);
          setCurrentPosition(newPosition);
        });
      } catch (error) {
        console.error("Error setting up location watch:", error);
      }
    };

    initialize();
    return () => {
      console.log("Cleaning up location watch...");
      unsubscribe && unsubscribe();
    };
  }, [
    isInitialized,
    startPosition,
    setStartPosition,
    setCurrentPosition,
    setSafeArea,
    setIsInitialized,
  ]);

  return null;
}
