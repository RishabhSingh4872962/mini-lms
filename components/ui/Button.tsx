import React from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  size = "md",
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const containerStyles: Record<string, string> = {
    primary: isDisabled
      ? "bg-indigo-300"
      : "bg-indigo-600 active:bg-indigo-700",
    outline: isDisabled
      ? "border border-slate-200"
      : "border border-indigo-600 active:bg-indigo-50",
    ghost: "active:bg-slate-100",
  };

  const textStyles: Record<string, string> = {
    primary: "text-white",
    outline: isDisabled ? "text-slate-400" : "text-indigo-600",
    ghost: isDisabled ? "text-slate-400" : "text-indigo-600",
  };

  const sizeStyles: Record<string, string> = {
    sm: "py-2 px-4 rounded-xl",
    md: "py-4 px-6 rounded-2xl",
    lg: "py-5 px-8 rounded-2xl",
  };

  const textSizeStyles: Record<string, string> = {
    sm: "text-sm font-semibold",
    md: "text-base font-semibold",
    lg: "text-lg font-bold",
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`w-full items-center justify-center flex-row gap-2 ${containerStyles[variant]} ${sizeStyles[size]}`}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? "#ffffff" : "#4F46E5"}
        />
      ) : null}
      <Text className={`${textStyles[variant]} ${textSizeStyles[size]}`}>
        {loading ? "Please wait..." : title}
      </Text>
    </Pressable>
  );
}
