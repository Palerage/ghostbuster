// utils/distanceUtils.ts
import { Position } from "../types";
import { SEARCH_ZONE_RADIUS } from "../utils/constants";

export const getDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Jordens radie i meter
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Avstånd i meter
};

// Beräkna punkt på SearchArea-cirkelns kant längs linjen till searchCenter
export const getShortenedEndPoint = (
  start: Position, // currentPosition
  end: Position // searchCenter
): Position => {
  const deltaLat = end.latitude - start.latitude;
  const deltaLon = end.longitude - start.longitude;
  const totalDistance = getDistance(
    start.latitude,
    start.longitude,
    end.latitude,
    end.longitude
  );

  // Om spelaren är inom SearchArea, ingen linje behövs
  if (totalDistance <= SEARCH_ZONE_RADIUS) {
    return start;
  }

  // Beräkna vektorn från start till end och normalisera den
  const metersPerDegreeLat = 111000;
  const metersPerDegreeLon =
    111000 * Math.cos((start.latitude * Math.PI) / 180);

  // Konvertera delta till meter
  const dx = deltaLon * metersPerDegreeLon;
  const dy = deltaLat * metersPerDegreeLat;
  const magnitude = Math.sqrt(dx * dx + dy * dy);

  // Normalisera vektorn och skala till SEARCH_ZONE_RADIUS från end
  const unitX = dx / magnitude;
  const unitY = dy / magnitude;

  const shortenedLat =
    end.latitude - (SEARCH_ZONE_RADIUS * unitY) / metersPerDegreeLat;
  const shortenedLon =
    end.longitude - (SEARCH_ZONE_RADIUS * unitX) / metersPerDegreeLon;

  return {
    latitude: shortenedLat,
    longitude: shortenedLon,
    timestamp: Date.now(),
  };
};
