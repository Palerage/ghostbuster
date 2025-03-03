// screens/MapScreen.tsx
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocation } from "../contexts/LocationContext";
import { useState, useRef } from "react";
import MapView from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import MapComponent from "../components/MapComponent";
import LocationInitializer from "../components/LocationInitializer";
import DistanceTracker from "../components/DistanceTracker";
import StatusDisplay from "../components/StatusDisplay";
import FocusButton from "../components/FocusButton";
import { findSafePoint } from "../services/safePointService";
import { TARGET_DISTANCE, SEARCH_ZONE_RADIUS } from "../utils/constants";
import { getDistance } from "../utils/distanceUtils";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../utils/colors";
import VibrationHandler from "@/components/VibrationHandler";

export default function MapScreen() {
  const {
    startPosition,
    currentPosition,
    safeArea,
    targetPosition,
    searchCenter,
    userWalkedDistance,
    setSafeArea,
  } = useLocation();

  const [isInitialized, setIsInitialized] = useState(false);
  const [distanceToSafeEdge, setDistanceToSafeEdge] = useState<number | null>(
    null
  );
  const [isRegenerating, setIsRegenerating] = useState(false);
  const mapRef = useRef<MapView>(null);

  console.log("MapScreen rendering...");
  console.log("startPosition:", startPosition);
  console.log("safeArea:", safeArea);
  console.log("currentPosition:", currentPosition);
  console.log("targetPosition:", targetPosition);
  console.log("searchCenter:", searchCenter);
  console.log("userWalkedDistance:", userWalkedDistance);
  console.log("isInitialized:", isInitialized);
  console.log("isRegenerating:", isRegenerating);

  const regenerateSafePoint = async () => {
    if (!currentPosition) return;

    setIsRegenerating(true);
    const remainingDistance = Math.max(TARGET_DISTANCE - userWalkedDistance, 0);
    console.log(
      "Regenerating safePoint with remaining distance:",
      remainingDistance
    );

    const newSafePoint = await findSafePoint(
      currentPosition.latitude,
      currentPosition.longitude,
      10,
      remainingDistance
    );

    if (newSafePoint) {
      setSafeArea({ safePoint: newSafePoint, radius: safeArea.radius });
      console.log("New safePoint set:", newSafePoint);
    } else {
      console.error("Failed to generate a new safePoint");
    }
    setIsRegenerating(false);
  };

  const isInsideSearchArea =
    currentPosition && searchCenter
      ? getDistance(
          currentPosition.latitude,
          currentPosition.longitude,
          searchCenter.latitude,
          searchCenter.longitude
        ) <= SEARCH_ZONE_RADIUS
      : false;

  return (
    <SafeAreaView style={styles.container}>
      <LocationInitializer
        isInitialized={isInitialized}
        setIsInitialized={setIsInitialized}
      />
      <VibrationHandler />

      {startPosition && safeArea.safePoint && !isRegenerating ? (
        <MapComponent
          mapRef={mapRef}
          startPosition={startPosition}
          currentPosition={currentPosition}
          safeArea={safeArea}
          targetPosition={targetPosition}
        />
      ) : (
        <Text style={styles.loadingText}>
          Calibrating ectoplasmic sensors...
        </Text>
      )}

      {startPosition && safeArea.safePoint && !isRegenerating && (
        <>
          <View style={styles.interact}>
            <FocusButton
              mapRef={mapRef}
              focusTarget={currentPosition}
              iconName="person-outline"
            />
            {searchCenter && (
              <FocusButton
                mapRef={mapRef}
                focusTarget={searchCenter}
                iconName="skull-outline"
              />
            )}
            <TouchableOpacity
              style={[
                styles.regenerateButton,
                !isInsideSearchArea && styles.disabledButton,
              ]}
              onPress={regenerateSafePoint}
              disabled={!isInsideSearchArea}
            >
              <Ionicons size={26} name="sync-outline" color={COLORS.accent} />
            </TouchableOpacity>
          </View>
          <SafeAreaView style={styles.info}>
            <DistanceTracker setDistanceToSafeEdge={setDistanceToSafeEdge} />
            <StatusDisplay
              distanceToSafeEdge={distanceToSafeEdge}
              userWalkedDistance={userWalkedDistance}
            />
          </SafeAreaView>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
  },
  interact: {
    position: "absolute",
    bottom: 6,
    display: "flex",
    flexDirection: "row",
    alignItems: "center", // Centrerar knapparna vertikalt
    justifyContent: "space-around",
    width: "100%",
    height: 64,
    backgroundColor: "transparent",
  },
  info: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "auto",
  },
  regenerateButton: {
    width: 60, // Synkroniserar med FocusButton
    height: 60, // Synkroniserar med FocusButton
    borderRadius: 60,
    backgroundColor: "rgba(0,0,0,1)",
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "rgba(0,0,0,0.5)",
    opacity: 0.7,
  },
});
