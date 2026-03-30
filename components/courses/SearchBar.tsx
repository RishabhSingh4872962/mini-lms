import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import { Pressable, TextInput, View } from "react-native";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search courses...",
}: SearchBarProps) {
  const inputRef = useRef<TextInput>(null);

  return (
    <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 h-12 gap-3">
      <Ionicons name="search-outline" size={20} color="#94A3B8" />
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        className="flex-1 text-slate-900 text-base"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => {
            onChangeText("");
            inputRef.current?.focus();
          }}
          hitSlop={10}
        >
          <Ionicons name="close-circle" size={18} color="#94A3B8" />
        </Pressable>
      ) : null}
    </View>
  );
}
