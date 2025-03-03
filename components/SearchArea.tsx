// components/SearchArea.tsx
import { useEffect } from "react";
import { Circle } from "react-native-maps";
import { Position } from "../types";
import { SEARCH_ZONE_RADIUS, SAFE_ZONE_RADIUS } from "../utils/constants";
import { useLocation } from "../contexts/LocationContext";

interface SearchAreaProps {
  safePoint: Position;
}

export default function SearchArea({ safePoint }: SearchAreaProps) {
  const { setSearchCenter, searchCenter } = useLocation();

  useEffect(() => {
    const maxOffset = SEARCH_ZONE_RADIUS - SAFE_ZONE_RADIUS - 10; // Max avstånd från safePoint (75 - 25 - 10 = 40m)
    const angle = Math.random() * 2 * Math.PI; // Slumpmässig vinkel
    const distance = Math.random() * maxOffset; // Slumpmässigt avstånd upp till 40m

    const metersPerDegreeLat = 111000;
    const metersPerDegreeLon =
      111000 * Math.cos((safePoint.latitude * Math.PI) / 180);

    const deltaLat = (distance * Math.cos(angle)) / metersPerDegreeLat;
    const deltaLon = (distance * Math.sin(angle)) / metersPerDegreeLon;

    const newCenter = {
      latitude: safePoint.latitude + deltaLat,
      longitude: safePoint.longitude + deltaLon,
      timestamp: Date.now(),
    };

    console.log("SearchArea center calculated:", newCenter);
    setSearchCenter(newCenter);
  }, [safePoint, setSearchCenter]);

  return searchCenter ? (
    <Circle
      center={{
        latitude: searchCenter.latitude,
        longitude: searchCenter.longitude,
      }}
      radius={SEARCH_ZONE_RADIUS}
      strokeColor="rgba(119, 0, 255, 0)"
      fillColor="rgba(119, 0, 255, 0.2)"
    />
  ) : null;
}
