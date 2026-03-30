import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = "search-outline",
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View className="w-20 h-20 bg-slate-100 rounded-3xl items-center justify-center mb-5">
        <Ionicons name={icon} size={36} color="#94A3B8" />
      </View>
      <Text className="text-slate-900 text-xl font-bold text-center mb-2">
        {title}
      </Text>
      {description ? (
        <Text className="text-slate-500 text-sm text-center leading-relaxed mb-6">
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          className="bg-indigo-600 px-8 py-3 rounded-2xl active:bg-indigo-700"
        >
          <Text className="text-white font-bold text-sm">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
