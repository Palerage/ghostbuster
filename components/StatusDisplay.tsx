// components/StatusDisplay.tsx
import { View, Text, StyleSheet, Alert } from "react-native";
import { useLocation } from "../contexts/LocationContext";
import { useEffect, useRef } from "react";
import { getDistance } from "@/utils/distanceUtils";
import { COLORS } from "@/utils/colors";

interface StatusDisplayProps {
  distanceToSafeEdge: number | null;
  userWalkedDistance: number;
}

export default function StatusDisplay({
  distanceToSafeEdge,
  userWalkedDistance,
}: StatusDisplayProps) {
  const { targetPosition, currentPosition, safeArea } = useLocation();
  const wasTargetSet = useRef<boolean>(false);

  // Beräkna avstånd till safePoint för visning
  const distanceToSafePoint =
    currentPosition && safeArea.safePoint
      ? getDistance(
          currentPosition.latitude,
          currentPosition.longitude,
          safeArea.safePoint.latitude,
          safeArea.safePoint.longitude
        )
      : null;

  // Visa alert när targetPosition sätts
  useEffect(() => {
    if (targetPosition && !wasTargetSet.current) {
      Alert.alert(
        "Ghost Detected!",
        "You've reached the Safe Area! 👻",
        [
          {
            text: "OK",
            onPress: () => console.log("Player pressed OK"),
          },
        ],
        { cancelable: false }
      );
      wasTargetSet.current = true; // Markera att alerten har visats
    } else if (!targetPosition) {
      wasTargetSet.current = false; // Återställ om targetPosition rensas
    }
  }, [targetPosition]);

  return (
    <View style={styles.statusContainer}>
      {targetPosition ? (
        <Text style={styles.statusText}>Ghost Detected! 👻</Text>
      ) : (
        <>
          {/* <Text style={styles.statusText}>
            Avstånd till SearchArea-gräns:{" "}
            {(distanceToSafeEdge ?? 0).toFixed(1)} m
          </Text> */}
          {/* <Text style={styles.statusText}>Status: Utanför SearchArea</Text> */}
          <Text style={styles.statusText}>
            Avstånd till SafePoint: {(distanceToSafePoint ?? 0).toFixed(1)} m
          </Text>
          <Text style={styles.statusText}>
            Totalt gått avstånd: {userWalkedDistance.toFixed(1)} m
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  statusContainer: {
    backgroundColor: COLORS.bg,
    width: "100%",
    padding: 10,
    alignItems: "center",
  },
  statusText: {
    color: COLORS.accent,
    fontSize: 14,
    marginVertical: 2,
  },
});
