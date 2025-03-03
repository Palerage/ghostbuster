// components/VibrationHandler.tsx
import { useEffect, useRef } from "react";
import { Vibration } from "react-native";
import { useLocation } from "../contexts/LocationContext";
import { getDistance } from "../utils/distanceUtils";
import { SEARCH_ZONE_RADIUS, SAFE_ZONE_RADIUS } from "../utils/constants";

const VibrationHandler = () => {
  const { currentPosition, searchCenter, safeArea, targetPosition } =
    useLocation();
  const vibrationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const wasInsideSearchArea = useRef<boolean>(false);

  useEffect(() => {
    // Beräkna avstånd till SearchArea och SafeArea
    const distanceToSearchCenter =
      currentPosition && searchCenter
        ? getDistance(
            currentPosition.latitude,
            currentPosition.longitude,
            searchCenter.latitude,
            searchCenter.longitude
          )
        : Infinity;

    const distanceToSafePoint =
      currentPosition && safeArea.safePoint
        ? getDistance(
            currentPosition.latitude,
            currentPosition.longitude,
            safeArea.safePoint.latitude,
            safeArea.safePoint.longitude
          )
        : Infinity;

    const isInsideSearchArea = distanceToSearchCenter <= SEARCH_ZONE_RADIUS;

    // Om inte inne i SearchArea eller targetPosition är satt, stäng av vibration och returnera
    if (!isInsideSearchArea || targetPosition) {
      if (vibrationIntervalRef.current) {
        clearInterval(vibrationIntervalRef.current);
        vibrationIntervalRef.current = null;
      }
      wasInsideSearchArea.current = false;
      return;
    }

    // Starta vibration om vi precis gick in i SearchArea
    if (isInsideSearchArea && !wasInsideSearchArea.current) {
      wasInsideSearchArea.current = true;
    }

    // Beräkna intensitet och intervall baserat på avstånd till SafeArea
    const maxDistance = SEARCH_ZONE_RADIUS - SAFE_ZONE_RADIUS; // Max avstånd inom SearchArea till SafeArea
    const normalizedDistance = Math.min(
      Math.max((distanceToSafePoint - SAFE_ZONE_RADIUS) / maxDistance, 0),
      1
    ); // 0 (vid SafeArea) till 1 (vid SearchArea-gräns)

    // Dynamiskt intervall: 2000ms (långsamt) till 200ms (snabbt) när närmare SafeArea
    const intervalTime = 200 + (1 - normalizedDistance) * 1800; // Från 2000ms (långt) till 200ms (tätt)
    // Dynamisk intensitet: 100ms (svag) till 500ms (stark) när närmare SafeArea
    const vibrationDuration = 100 + (1 - normalizedDistance) * 400; // Från 100ms (svag) till 500ms (stark)

    // Om vibration redan körs, stäng av innan ny start
    if (vibrationIntervalRef.current) {
      clearInterval(vibrationIntervalRef.current);
    }

    // Starta vibration med dynamiskt intervall
    vibrationIntervalRef.current = setInterval(() => {
      Vibration.vibrate(vibrationDuration);
    }, intervalTime);

    // Cleanup vid unmount eller ändring
    return () => {
      if (vibrationIntervalRef.current) {
        clearInterval(vibrationIntervalRef.current);
      }
    };
  }, [currentPosition, searchCenter, safeArea, targetPosition]);

  return null; // Komponenten renderar inget visuellt
};

export default VibrationHandler;
