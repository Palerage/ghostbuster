export interface Position {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export interface Building {
  type: string;
  geometry: { lat: number; lon: number }[];
}

export interface SafeArea {
  safePoint: Position | null;
  radius: number;
}
