// components/DistanceTracker.tsx
import { useEffect, useRef } from "react";
import { getDistance } from "../utils/distanceUtils";
import { useLocation } from "../contexts/LocationContext";
import { SAFE_ZONE_RADIUS } from "../utils/constants";
import { Position } from "../types";

interface DistanceTrackerProps {
  setDistanceToSafeEdge: (distance: number | null) => void;
}

export default function DistanceTracker({
  setDistanceToSafeEdge,
}: DistanceTrackerProps) {
  const {
    startPosition,
    currentPosition,
    safeArea,
    targetPosition,
    setTargetPosition,
    setUserWalkedDistance,
  } = useLocation();
  const wasInsideSafeArea = useRef<boolean>(false);

  useEffect(() => {
    console.log("DistanceTracker useEffect running...");
    if (!currentPosition || !safeArea.safePoint) {
      console.log("Missing currentPosition or safeArea.safePoint, skipping...");
      return;
    }

    // Beräkna avstånd till safeArea-mittpunkten
    const distanceToSafePoint = getDistance(
      currentPosition.latitude,
      currentPosition.longitude,
      safeArea.safePoint.latitude,
      safeArea.safePoint.longitude
    );
    const distanceToEdge = distanceToSafePoint - SAFE_ZONE_RADIUS;
    setDistanceToSafeEdge(distanceToEdge);
    console.log("Distance to SafeArea edge:", distanceToEdge);

    // Beräkna avstånd från startPosition till currentPosition
    if (startPosition) {
      const walkedDistance = getDistance(
        startPosition.latitude,
        startPosition.longitude,
        currentPosition.latitude,
        currentPosition.longitude
      );
      setUserWalkedDistance(walkedDistance);
      console.log("Distance walked from startPosition:", walkedDistance);
    } else {
      console.log("No startPosition yet, cannot calculate walked distance");
    }

    const isInside = distanceToSafePoint <= SAFE_ZONE_RADIUS;
    console.log(
      "isInside SafeArea:",
      isInside,
      "wasInsideSafeArea:",
      wasInsideSafeArea.current
    );

    if (!targetPosition && !wasInsideSafeArea.current && isInside) {
      console.log(
        "Setting targetPosition to currentPosition:",
        currentPosition
      );
      setTargetPosition(currentPosition);
    }

    wasInsideSafeArea.current = isInside;
  }, [
    startPosition,
    currentPosition,
    safeArea,
    targetPosition,
    setTargetPosition,
    setDistanceToSafeEdge,
    setUserWalkedDistance,
  ]);

  return null;
}
