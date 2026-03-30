import { Ionicons } from "@expo/vector-icons";
import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
    // In production you'd send this to Sentry / Crashlytics
    console.error("[ErrorBoundary]", error.message, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <View className="flex-1 bg-slate-50 items-center justify-center px-6">
          <View className="w-20 h-20 bg-red-50 rounded-3xl items-center justify-center mb-5">
            <Ionicons name="bug-outline" size={36} color="#EF4444" />
          </View>

          <Text className="text-slate-900 text-xl font-bold text-center mb-2">
            Something went wrong
          </Text>
          <Text className="text-slate-500 text-sm text-center leading-relaxed mb-6">
            An unexpected error occurred. We have logged it and will fix it
            soon.
          </Text>

          {/* Error detail (dev only) */}
          {__DEV__ && this.state.error ? (
            <ScrollView
              className="w-full bg-slate-900 rounded-2xl p-4 mb-6 max-h-40"
              showsVerticalScrollIndicator={false}
            >
              <Text className="text-green-400 font-mono text-xs leading-relaxed">
                {this.state.error.message}
              </Text>
            </ScrollView>
          ) : null}

          <Pressable
            onPress={this.handleReset}
            className="bg-indigo-600 px-8 py-4 rounded-2xl w-full items-center active:bg-indigo-700"
          >
            <Text className="text-white font-bold text-base">Try Again</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
