import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

function SkeletonBox({ className }: { className: string }) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={{ opacity }}
      className={`bg-slate-200 rounded-xl ${className}`}
    />
  );
}

export function CourseCardSkeleton() {
  return (
    <View className="bg-white mx-4 mb-3 rounded-3xl overflow-hidden border border-slate-100">
      <SkeletonBox className="w-full h-40 rounded-none" />
      <View className="p-4 gap-3">
        <View className="flex-row gap-2">
          <SkeletonBox className="w-20 h-5" />
          <SkeletonBox className="w-16 h-5" />
        </View>
        <SkeletonBox className="w-full h-5" />
        <SkeletonBox className="w-3/4 h-5" />
        <View className="flex-row items-center gap-2">
          <SkeletonBox className="w-6 h-6 rounded-full" />
          <SkeletonBox className="w-32 h-4" />
        </View>
        <View className="flex-row justify-between items-center">
          <SkeletonBox className="w-28 h-4" />
          <SkeletonBox className="w-16 h-5" />
        </View>
      </View>
    </View>
  );
}
