import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { NetworkStatusProvider } from "@/components/common/NetworkStatusProvider";
import { OfflineBanner } from "@/components/common/OfflineBanner";
import { useAuthStore } from "@/stores/authStore";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";

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
        <ErrorBoundary>
          <NetworkStatusProvider>
            {/* Floating offline banner — sits above everything */}
            <OfflineBanner />

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
              <Stack.Screen
                name="course/webview/[id]"
                options={{
                  animation: "slide_from_bottom",
                  presentation: "card",
                }}
              />
            </Stack>
          </NetworkStatusProvider>
        </ErrorBoundary>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}
