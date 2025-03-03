// components/MapComponent.tsx
import { StyleSheet } from "react-native";
import MapView, { Marker, Circle, Polyline } from "react-native-maps";
import { Position, SafeArea } from "../types";
import SearchArea from "./SearchArea";
import { useLocation } from "../contexts/LocationContext";
import { getDistance, getShortenedEndPoint } from "../utils/distanceUtils";
import { SEARCH_ZONE_RADIUS } from "../utils/constants";

interface MapComponentProps {
  mapRef: React.RefObject<MapView>;
  startPosition: Position;
  currentPosition: Position | null;
  safeArea: SafeArea;
  targetPosition: Position | null;
}

const targetIcon = require("../assets/images/ghost-icon.png");

export default function MapComponent({
  mapRef,
  startPosition,
  currentPosition,
  safeArea,
  targetPosition,
}: MapComponentProps) {
  const { searchCenter } = useLocation();

  // Kontrollera om spelaren är inne i SearchArea med getDistance
  const isInsideSearchArea =
    currentPosition && searchCenter
      ? getDistance(
          currentPosition.latitude,
          currentPosition.longitude,
          searchCenter.latitude,
          searchCenter.longitude
        ) <= SEARCH_ZONE_RADIUS
      : false;

  // Beräkna avkortad slutpunkt för Polyline
  const shortenedEndPoint =
    currentPosition && searchCenter
      ? getShortenedEndPoint(currentPosition, searchCenter)
      : null;

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={{
        latitude: startPosition.latitude,
        longitude: startPosition.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }}
    >
      <Marker
        coordinate={{
          latitude: startPosition.latitude,
          longitude: startPosition.longitude,
        }}
        title="Startposition"
        pinColor="yellow"
      />
      {currentPosition && (
        <Circle
          center={{
            latitude: currentPosition.latitude,
            longitude: currentPosition.longitude,
          }}
          radius={5}
          fillColor="#007AFF"
          strokeWidth={0}
        />
      )}
      {safeArea.safePoint && (
        <>
          <SearchArea safePoint={safeArea.safePoint} />
          <Circle
            center={{
              latitude: safeArea.safePoint.latitude,
              longitude: safeArea.safePoint.longitude,
            }}
            radius={safeArea.radius}
            strokeColor="rgba(0, 255, 0, 0.5)"
            fillColor="rgba(0, 255, 0, 0.2)"
          />
          <Marker
            coordinate={{
              latitude: safeArea.safePoint.latitude,
              longitude: safeArea.safePoint.longitude,
            }}
            title="Safe Area Center"
            pinColor="green"
          />
          {currentPosition &&
            searchCenter &&
            !targetPosition &&
            !isInsideSearchArea &&
            shortenedEndPoint && (
              <Polyline
                coordinates={[
                  {
                    latitude: currentPosition.latitude,
                    longitude: currentPosition.longitude,
                  },
                  {
                    latitude: shortenedEndPoint.latitude,
                    longitude: shortenedEndPoint.longitude,
                  },
                ]}
                strokeColor="rgba(119, 0, 255, 0.2)"
                strokeWidth={2}
              />
            )}
        </>
      )}
      {targetPosition && (
        <Marker
          coordinate={{
            latitude: targetPosition.latitude,
            longitude: targetPosition.longitude,
          }}
          title="Target Position"
          image={targetIcon}
        />
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
