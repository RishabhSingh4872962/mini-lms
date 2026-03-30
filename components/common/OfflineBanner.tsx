import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";

export function OfflineBanner() {
  const { isConnected, isInternetReachable, isChecking, recheck } =
    useNetworkStatus();

  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const isOffline = !isChecking && (!isConnected || !isInternetReachable);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: isOffline ? 0 : -80,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }),
      Animated.timing(opacity, {
        toValue: isOffline ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isOffline]);

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
        opacity,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 999,
      }}
      pointerEvents={isOffline ? "auto" : "none"}
    >
      <View className="bg-slate-900 mx-3 mt-2 rounded-2xl px-4 py-3 flex-row items-center gap-3 shadow-lg">
        <View className="w-8 h-8 bg-white/10 rounded-xl items-center justify-center">
          <Ionicons name="cloud-offline-outline" size={18} color="#F87171" />
        </View>

        <View className="flex-1">
          <Text className="text-white font-bold text-sm">No connection</Text>
          <Text className="text-slate-400 text-xs mt-0.5">
            Check your internet and try again
          </Text>
        </View>

        <Pressable
          onPress={recheck}
          hitSlop={10}
          className="bg-white/10 rounded-xl px-3 py-1.5 active:bg-white/20"
        >
          <Text className="text-white text-xs font-bold">Retry</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}
