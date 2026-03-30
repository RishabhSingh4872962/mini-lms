import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "expo-router";
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
import { loginSchema, type LoginFormData } from "@/schemas/auth.schema";
import { useAuthStore } from "@/stores/authStore";

export default function LoginScreen() {
  const { login, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      router.replace("/(tabs)");
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
          {/* ── Hero Section ── */}
          <View className="items-center pt-14 pb-8 px-6">
            <View className="w-20 h-20 bg-indigo-600 rounded-3xl items-center justify-center mb-5 shadow-lg">
              <Ionicons name="school" size={40} color="white" />
            </View>
            <Text className="text-3xl font-bold text-slate-900 tracking-tight">
              LearnHub
            </Text>
            <Text className="text-slate-500 mt-1.5 text-base">
              Your learning journey starts here
            </Text>
          </View>

          {/* ── Form Card ── */}
          <View className="mx-5 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <Text className="text-2xl font-bold text-slate-900 mb-1">
              Welcome back 👋
            </Text>
            <Text className="text-slate-500 mb-6 text-sm">
              Sign in to continue learning
            </Text>

            {error ? (
              <ErrorBanner message={error} onDismiss={clearError} />
            ) : null}

            <Controller
              control={control}
              name="username"
              render={({ field }) => (
                <Input
                  label="Username"
                  placeholder="Enter your username"
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
                  placeholder="Enter your password"
                  icon="lock-closed-outline"
                  value={field.value}
                  onChangeText={(text) => {
                    clearError();
                    field.onChange(text);
                  }}
                  onBlur={field.onBlur}
                  error={errors.password?.message}
                  secureTextEntry
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit(onSubmit)}
                />
              )}
            />

            <View className="mt-2">
              <Button
                title="Sign In"
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
              />
            </View>

            <View className="flex-row justify-center items-center mt-6 gap-1">
              <Text className="text-slate-500 text-sm">
                Dont have an account?
              </Text>
              <Link href="/(auth)/register" asChild>
                <Pressable>
                  <Text className="text-indigo-600 font-bold text-sm">
                    Register
                  </Text>
                </Pressable>
              </Link>
            </View>
          </View>

          {/* ── Demo Hint ── */}
          <View className="mx-5 mt-4 mb-8 bg-indigo-50 rounded-2xl p-4 flex-row items-center gap-3">
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#4F46E5"
            />
            <Text className="text-indigo-700 text-xs flex-1">
              Demo credentials — username:{" "}
              <Text className="font-bold">doejohn</Text>
              {"  "}password: <Text className="font-bold">test@123</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
