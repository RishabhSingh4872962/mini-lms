import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Input } from "@/components/ui/Input";
import { registerSchema, type RegisterFormData } from "@/schemas/auth.schema";
import { useAuthStore } from "@/stores/authStore";

export default function RegisterScreen() {
  const { register, isLoading, error, clearError } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { confirmPassword: _, ...payload } = data;
      await register(payload);
    } catch {
      // Error handled by store
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <View className="px-6 pt-10 pb-6">
            <View className="w-14 h-14 bg-indigo-600 rounded-2xl items-center justify-center mb-4">
              <Ionicons name="school" size={28} color="white" />
            </View>
            <Text className="text-3xl font-bold text-slate-900 tracking-tight">
              Create account
            </Text>
            <Text className="text-slate-500 mt-1.5 text-sm">
              Start your learning journey today
            </Text>
          </View>

          {/* ── Form Card ── */}
          <View className="mx-5 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
            {error ? (
              <ErrorBanner message={error} onDismiss={clearError} />
            ) : null}

            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <Input
                  label="Email"
                  placeholder="you@example.com"
                  icon="mail-outline"
                  value={field.value}
                  onChangeText={(text) => {
                    clearError();
                    field.onChange(text);
                  }}
                  onBlur={field.onBlur}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  returnKeyType="next"
                />
              )}
            />

            <Controller
              control={control}
              name="username"
              render={({ field }) => (
                <Input
                  label="Username"
                  placeholder="Choose a username"
                  icon="person-outline"
                  value={field.value}
                  onChangeText={(text) => {
                    clearError();
                    field.onChange(text);
                  }}
                  onBlur={field.onBlur}
                  error={errors.username?.message}
                  returnKeyType="next"
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <Input
                  label="Password"
                  placeholder="Create a strong password"
                  icon="lock-closed-outline"
                  value={field.value}
                  onChangeText={(text) => {
                    clearError();
                    field.onChange(text);
                  }}
                  onBlur={field.onBlur}
                  error={errors.password?.message}
                  secureTextEntry
                  returnKeyType="next"
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field }) => (
                <Input
                  label="Confirm Password"
                  placeholder="Repeat your password"
                  icon="shield-checkmark-outline"
                  value={field.value}
                  onChangeText={(text) => {
                    clearError();
                    field.onChange(text);
                  }}
                  onBlur={field.onBlur}
                  error={errors.confirmPassword?.message}
                  secureTextEntry
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit(onSubmit)}
                />
              )}
            />

            <View className="mt-2">
              <Button
                title="Create Account"
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
              />
            </View>

            <View className="flex-row justify-center items-center mt-6 gap-1">
              <Text className="text-slate-500 text-sm">
                Already have an account?
              </Text>
              <Link href="/(auth)/login" asChild>
                <Pressable>
                  <Text className="text-indigo-600 font-bold text-sm">
                    Sign In
                  </Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
