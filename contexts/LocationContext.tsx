// contexts/LocationContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";
import { SAFE_ZONE_RADIUS } from "../utils/constants";

interface Position {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface SafeArea {
  safePoint: Position | null;
  radius: number;
}

interface LocationContextType {
  startPosition: Position | null;
  setStartPosition: (position: Position | null) => void;
  currentPosition: Position | null;
  setCurrentPosition: (position: Position | null) => void;
  safeArea: SafeArea;
  setSafeArea: (safeArea: SafeArea | ((prev: SafeArea) => SafeArea)) => void;
  targetPosition: Position | null;
  setTargetPosition: (position: Position | null) => void;
  searchCenter: Position | null;
  setSearchCenter: (center: Position | null) => void;
  userWalkedDistance: number; // Nytt state för avståndet spelaren har gått
  setUserWalkedDistance: (distance: number) => void; // Setter för userWalkedDistance
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider = ({ children }: LocationProviderProps) => {
  const [startPosition, setStartPosition] = useState<Position | null>(null);
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [safeArea, setSafeArea] = useState<SafeArea>({
    safePoint: null,
    radius: SAFE_ZONE_RADIUS,
  });
  const [targetPosition, setTargetPosition] = useState<Position | null>(null);
  const [searchCenter, setSearchCenter] = useState<Position | null>(null);
  const [userWalkedDistance, setUserWalkedDistance] = useState<number>(0);

  const value: LocationContextType = {
    startPosition,
    setStartPosition,
    currentPosition,
    setCurrentPosition,
    safeArea,
    setSafeArea,
    targetPosition,
    setTargetPosition,
    searchCenter,
    setSearchCenter,
    userWalkedDistance,
    setUserWalkedDistance,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation måste användas inom en LocationProvider");
  }
  return context;
};
