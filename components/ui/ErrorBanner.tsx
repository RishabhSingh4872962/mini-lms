import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <View className="flex-row items-center bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 gap-3">
      <Ionicons name="warning-outline" size={20} color="#EF4444" />
      <Text className="flex-1 text-red-600 text-sm font-medium">{message}</Text>
      {onDismiss ? (
        <Pressable onPress={onDismiss} hitSlop={10}>
          <Ionicons name="close" size={18} color="#EF4444" />
        </Pressable>
      ) : null}
    </View>
  );
}
