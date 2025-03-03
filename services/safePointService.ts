// services/safePointService.ts
import axios from "axios";
import { getDistance } from "../utils/distanceUtils";
import { Position } from "../types";
import {
  TARGET_TOLERANCE,
  TARGET_RADIUS,
  SEARCH_ZONE_RADIUS,
  TARGET_DISTANCE,
} from "../utils/constants";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchSafePoints = async (
  latitude: number,
  longitude: number,
  radius: number
): Promise<Position[]> => {
  const overpassQuery = `
    [out:json][timeout:25];
    (
      way["highway"~"path|footway|cycleway|residential|tertiary|secondary|primary|track"]["access"!~"private|restricted"]["building"!~"yes"]["waterway"!~"yes"]["railway"!~"yes"](around:${radius},${latitude},${longitude});
      way["leisure"~"park|playground|nature_reserve|garden"]["access"!~"private|restricted"]["building"!~"yes"]["waterway"!~"yes"]["railway"!~"yes"](around:${radius},${latitude},${longitude});
      way["landuse"~"grass|meadow|forest|recreation_ground"]["access"!~"private|restricted"]["building"!~"yes"]["waterway"!~"yes"]["railway"!~"yes"](around:${radius},${latitude},${longitude});
      way["amenity"~"park|public|community_centre"]["access"!~"private|restricted"]["building"!~"yes"]["waterway"!~"yes"]["railway"!~"yes"](around:${radius},${latitude},${longitude});
    );
    out center;
  `;

  try {
    await delay(2000);
    const response = await axios.get(
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
        overpassQuery
      )}`
    );
    const points = response.data.elements
      .filter((el: any) => el.type === "way" && el.center)
      .map((el: any) => ({
        latitude: el.center.lat,
        longitude: el.center.lon,
        timestamp: Date.now(),
      }));
    console.log(
      `Found ${points.length} potential safe points within ${radius}m radius`
    );
    return points;
  } catch (error) {
    console.error("Error fetching safe points:", error);
    return [];
  }
};

export const checkForHazards = async (
  latitude: number,
  longitude: number,
  radius: number
): Promise<{
  hasRailway: boolean;
  hasHighway: boolean;
  hasIndustrial: boolean;
}> => {
  const hazardQuery = `
    [out:json][timeout:25];
    (
      way["railway"](around:${radius},${latitude},${longitude});
      way["highway"~"motorway|trunk"](around:${radius},${latitude},${longitude});
      way["landuse"="industrial"](around:${radius},${latitude},${longitude});
    );
    out center;
  `;

  try {
    await delay(2000);
    const response = await axios.get(
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
        hazardQuery
      )}`
    );
    const elements = response.data.elements.filter(
      (el: any) => el.type === "way" && el.center
    );

    const hazards = {
      hasRailway: elements.some((el: any) => el.tags && el.tags["railway"]),
      hasHighway: elements.some(
        (el: any) => el.tags && el.tags["highway"]?.match(/motorway|trunk/)
      ),
      hasIndustrial: elements.some(
        (el: any) => el.tags && el.tags["landuse"] === "industrial"
      ),
    };
    console.log(`Hazard check at (${latitude}, ${longitude}):`, hazards);
    return hazards;
  } catch (error) {
    console.error("Error checking for hazards:", error);
    return { hasRailway: false, hasHighway: false, hasIndustrial: false };
  }
};

export const findSafePoint = async (
  latitude: number,
  longitude: number,
  maxAttempts: number = 10,
  customDistance?: number
): Promise<Position> => {
  const metersPerDegreeLat = 111000;
  const metersPerDegreeLon = 111000 * Math.cos((latitude * Math.PI) / 180);
  const targetDistance =
    customDistance !== undefined ? customDistance : TARGET_DISTANCE; // Använd TARGET_DISTANCE om inget anges
  const minDistance = targetDistance - TARGET_TOLERANCE; // t.ex. 150m om targetDistance = 200m
  const maxDistance = targetDistance + TARGET_TOLERANCE; // t.ex. 250m om targetDistance = 200m
  const searchRadius = SEARCH_ZONE_RADIUS;

  console.log(
    `Starting search from (${latitude}, ${longitude}) with target distance: ${targetDistance}m, tolerance: ±${TARGET_TOLERANCE}m`
  );

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const angle = Math.random() * 2 * Math.PI;
    const deltaLat = (targetDistance * Math.cos(angle)) / metersPerDegreeLat;
    const deltaLon = (targetDistance * Math.sin(angle)) / metersPerDegreeLon;
    const targetLat = latitude + deltaLat;
    const targetLon = longitude + deltaLon;

    console.log(
      `Attempt ${attempt + 1}: Checking (${targetLat}, ${targetLon})`
    );

    const safePoints = await fetchSafePoints(
      targetLat,
      targetLon,
      searchRadius
    );
    if (safePoints.length === 0) {
      console.log("Rejected: No safe points found within search radius");
      continue;
    }

    const validCandidates = safePoints
      .map((point) => ({
        ...point,
        distance: getDistance(
          latitude,
          longitude,
          point.latitude,
          point.longitude
        ),
      }))
      .filter(
        (point) =>
          point.distance >= minDistance && point.distance <= maxDistance
      );

    if (validCandidates.length === 0) {
      console.log(
        `Rejected: No candidates within distance range ${minDistance}-${maxDistance}m`
      );
      continue;
    }

    for (const candidate of validCandidates.sort(
      (a, b) =>
        Math.abs(a.distance - targetDistance) -
        Math.abs(b.distance - targetDistance)
    )) {
      console.log(
        `Selected candidate: (${candidate.latitude}, ${
          candidate.longitude
        }), distance: ${candidate.distance.toFixed(2)}m`
      );

      const hazards = await checkForHazards(
        candidate.latitude,
        candidate.longitude,
        TARGET_RADIUS
      );

      if (hazards.hasRailway || hazards.hasHighway || hazards.hasIndustrial) {
        if (hazards.hasRailway)
          console.log(
            `Rejected: Railway detected near (${candidate.latitude}, ${candidate.longitude})`
          );
        if (hazards.hasHighway)
          console.log(
            `Rejected: Motorway detected near (${candidate.latitude}, ${candidate.longitude})`
          );
        if (hazards.hasIndustrial)
          console.log(
            `Rejected: Industrial area detected near (${candidate.latitude}, ${candidate.longitude})`
          );
        continue;
      }

      console.log(
        `Safe point validated at (${candidate.latitude}, ${
          candidate.longitude
        }), distance: ${candidate.distance.toFixed(2)}m`
      );
      return {
        latitude: candidate.latitude,
        longitude: candidate.longitude,
        timestamp: candidate.timestamp,
      };
    }

    console.log("Rejected: All candidates in this attempt had hazards");
  }

  // Fallback: Generera en o-validerad punkt
  console.warn(
    "No safe point found after max attempts, generating fallback..."
  );
  const finalAngle = Math.random() * 2 * Math.PI;
  const finalLat =
    latitude + (targetDistance / metersPerDegreeLat) * Math.cos(finalAngle);
  const finalLon =
    longitude + (targetDistance / metersPerDegreeLon) * Math.sin(finalAngle);
  console.log(
    `Last resort: Returning unvalidated point at (${finalLat}, ${finalLon})`
  );
  return {
    latitude: finalLat,
    longitude: finalLon,
    timestamp: Date.now(),
  };
};
