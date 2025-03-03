import { COLORS } from "@/utils/colors";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveBackgroundColor: "black",
        tabBarInactiveBackgroundColor: "rgb(54, 58, 56)",
        tabBarActiveTintColor: COLORS.accent, // Aktiv färg (t.ex. en accentfärg)
        tabBarInactiveTintColor: "rgb(138, 153, 121)", // Inaktiv färg
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Map",
          tabBarIcon: ({ color, size }) => (
            <Ionicons size={size} name="map" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Hunter",
          tabBarIcon: ({ color, size }) => (
            <Ionicons size={size} name="person" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
