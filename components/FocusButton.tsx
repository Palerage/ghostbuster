// components/FocusButton.tsx
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import MapView from "react-native-maps";
import { Position } from "../types";
import { COLORS } from "../utils/colors";
import Ionicons from "@expo/vector-icons/Ionicons";

interface FocusButtonProps {
  mapRef: React.RefObject<MapView>;
  focusTarget: Position | null;
  iconName: keyof (typeof Ionicons)["glyphMap"];
}

export default function FocusButton({
  mapRef,
  focusTarget,
  iconName,
}: FocusButtonProps) {
  const focusOnTarget = () => {
    if (mapRef.current && focusTarget) {
      mapRef.current.animateCamera(
        {
          center: {
            latitude: focusTarget.latitude,
            longitude: focusTarget.longitude,
          },
          zoom: 17,
        },
        { duration: 1000 }
      );
    }
  };

  return (
    <TouchableOpacity style={styles.fab} onPress={focusOnTarget}>
      <Ionicons name={iconName} size={26} color={COLORS.accent} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 60,
    width: 60,
    borderRadius: 60,
    backgroundColor: COLORS.bg,
  },
});
