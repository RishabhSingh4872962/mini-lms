import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Pressable,
    Text,
    TextInput,
    View,
    type TextInputProps,
} from "react-native";

interface InputProps extends TextInputProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  secureTextEntry?: boolean;
}

export function Input({
  label,
  icon,
  error,
  secureTextEntry = false,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isVisible, setIsVisible] = useState(!secureTextEntry);

  const borderColor = error
    ? "border-red-400"
    : isFocused
      ? "border-indigo-500"
      : "border-slate-200";

  return (
    <View className="mb-4">
      <Text className="text-sm font-semibold text-slate-700 mb-2">{label}</Text>

      <View
        className={`flex-row items-center bg-slate-50 border rounded-2xl px-4 ${borderColor}`}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={20}
            color={error ? "#F87171" : isFocused ? "#4F46E5" : "#94A3B8"}
            style={{ marginRight: 10 }}
          />
        ) : null}

        <TextInput
          className="flex-1 py-4 text-slate-900 text-base"
          placeholderTextColor="#94A3B8"
          secureTextEntry={secureTextEntry && !isVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
          autoCorrect={false}
          {...props}
        />

        {secureTextEntry ? (
          <Pressable
            onPress={() => setIsVisible((v) => !v)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isVisible ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="#94A3B8"
            />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <View className="flex-row items-center mt-1.5 gap-1">
          <Ionicons name="alert-circle-outline" size={14} color="#F87171" />
          <Text className="text-red-400 text-xs flex-1">{error}</Text>
        </View>
      ) : null}
    </View>
  );
}
