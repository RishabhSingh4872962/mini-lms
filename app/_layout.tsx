import { useAuthStore } from "@/stores/authStore";
import { SplashScreen, Stack } from "expo-router";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css"; // NativeWind

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth().finally(async () => {
      await SplashScreen.hideAsync();
    });
  }, []);

  if (isCheckingAuth) return null;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="course/[id]"
            options={{
              animation: "slide_from_right",
              presentation: "card",
            }}
          />
        </Stack>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}
