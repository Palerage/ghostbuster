import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { LocationProvider } from "../contexts/LocationContext";

// RootLayout som en komponent utan extra export
export default function RootLayout() {
  return (
    <LocationProvider>
      <StatusBar style="light" backgroundColor="black" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </LocationProvider>
  );
}
