import { Button } from "@/components/ui/Button";
import { useCourseStore } from "@/stores/courseStore";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LEVEL_CONFIG = {
  Beginner: { color: "#10B981", bg: "#ECFDF5", label: "Beginner" },
  Intermediate: { color: "#F59E0B", bg: "#FFFBEB", label: "Intermediate" },
  Advanced: { color: "#EF4444", bg: "#FEF2F2", label: "Advanced" },
};

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCourseById, toggleBookmark, isBookmarked } = useCourseStore();
  const [enrolled, setEnrolled] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);

  const course = getCourseById(Number(id));
  const bookmarked = isBookmarked(Number(id));

  const handleEnroll = useCallback(async () => {
    if (enrolled) return;
    setEnrollLoading(true);
    // Simulate enroll API call
    await new Promise((res) => setTimeout(res, 1200));
    setEnrollLoading(false);
    setEnrolled(true);
    Alert.alert(
      "🎉 Enrolled!",
      `You are now enrolled in "${course?.title}". Start learning!`,
      [{ text: "Great!", style: "default" }],
    );
  }, [enrolled, course]);

  // ── Course not found ─────────────────────────────────────────────────────────
  if (!course) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={48} color="#94A3B8" />
        <Text className="text-slate-900 text-xl font-bold mt-4 mb-2">
          Course not found
        </Text>
        <Text className="text-slate-500 text-sm text-center mb-6">
          This course may have been removed or is unavailable.
        </Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          variant="outline"
        />
      </SafeAreaView>
    );
  }

  const instructorName = `${course.instructor.name.first} ${course.instructor.name.last}`;
  const levelConfig = LEVEL_CONFIG[course.level];

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ── Hero Image ── */}
        <View className="relative">
          <Image
            source={{ uri: course.thumbnail }}
            style={{ width: "100%", height: 280 }}
            contentFit="cover"
          />

          {/* Gradient overlay */}
          <View
            className="absolute bottom-0 left-0 right-0 h-24"
            style={{
              background: "transparent",
              backgroundColor: "rgba(0,0,0,0.3)",
            }}
          />

          {/* ── Top bar (Back + Bookmark) ── */}
          <SafeAreaView
            edges={["top"]}
            className="absolute top-0 left-0 right-0 flex-row items-center justify-between px-4 pt-2"
          >
            <Pressable
              onPress={() => router.back()}
              className="bg-white/90 rounded-2xl w-10 h-10 items-center justify-center"
              style={{ elevation: 4 }}
            >
              <Ionicons name="arrow-back" size={22} color="#1E293B" />
            </Pressable>

            <Pressable
              onPress={() => toggleBookmark(course.id)}
              className="bg-white/90 rounded-2xl w-10 h-10 items-center justify-center"
              style={{ elevation: 4 }}
            >
              <Ionicons
                name={bookmarked ? "bookmark" : "bookmark-outline"}
                size={20}
                color={bookmarked ? "#4F46E5" : "#1E293B"}
              />
            </Pressable>
          </SafeAreaView>
        </View>

        <View className="px-5 pt-5">
          {/* ── Category + Level ── */}
          <View className="flex-row items-center gap-2 mb-3">
            <View className="bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-1">
              <Text className="text-indigo-600 text-xs font-bold capitalize">
                {course.category}
              </Text>
            </View>
            <View
              className="rounded-xl px-3 py-1"
              style={{ backgroundColor: levelConfig.bg }}
            >
              <Text
                className="text-xs font-bold"
                style={{ color: levelConfig.color }}
              >
                {levelConfig.label}
              </Text>
            </View>
          </View>

          {/* ── Title ── */}
          <Text className="text-slate-900 text-2xl font-bold leading-tight mb-4">
            {course.title}
          </Text>

          {/* ── Stats row ── */}
          <View className="flex-row items-center gap-5 mb-5">
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text className="text-slate-800 font-bold text-sm">
                {course.rating}
              </Text>
              <Text className="text-slate-400 text-sm">
                ({course.reviewCount})
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="people-outline" size={16} color="#94A3B8" />
              <Text className="text-slate-500 text-sm">
                {course.studentsCount.toLocaleString()} students
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="time-outline" size={16} color="#94A3B8" />
              <Text className="text-slate-500 text-sm">{course.duration}</Text>
            </View>
          </View>

          {/* ── Instructor Card ── */}
          <View className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-5 flex-row items-center gap-4">
            <Image
              source={{ uri: course.instructor.picture.medium }}
              style={{ width: 56, height: 56, borderRadius: 28 }}
              contentFit="cover"
            />
            <View className="flex-1">
              <Text className="text-xs text-slate-400 font-medium mb-0.5">
                INSTRUCTOR
              </Text>
              <Text className="text-slate-900 font-bold text-base">
                {instructorName}
              </Text>
              <Text className="text-slate-500 text-sm" numberOfLines={1}>
                {course.instructor.location.city},{" "}
                {course.instructor.location.country}
              </Text>
            </View>
            <View className="bg-indigo-50 rounded-xl p-2">
              <Ionicons name="school-outline" size={20} color="#4F46E5" />
            </View>
          </View>

          {/* ── Description ── */}
          <Text className="text-slate-900 text-lg font-bold mb-2">
            About this course
          </Text>
          <Text className="text-slate-600 text-sm leading-relaxed mb-5">
            {course.description}
          </Text>

          {/* ── What you'll learn (synthetic) ── */}
          <Text className="text-slate-900 text-lg font-bold mb-3">
            What you will learn
          </Text>
          {[
            "Core concepts and practical applications",
            "Real-world projects and case studies",
            "Industry best practices and patterns",
            "Hands-on exercises and quizzes",
          ].map((item, i) => (
            <View key={i} className="flex-row items-start gap-3 mb-2.5">
              <View className="w-5 h-5 bg-indigo-100 rounded-full items-center justify-center mt-0.5">
                <Ionicons name="checkmark" size={12} color="#4F46E5" />
              </View>
              <Text className="text-slate-600 text-sm flex-1 leading-relaxed">
                {item}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* ── Sticky Bottom CTA ── */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-5 py-4"
        style={{ paddingBottom: 28, elevation: 10 }}
      >
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-slate-400 text-xs font-medium">
              Course price
            </Text>
            <Text className="text-slate-900 text-2xl font-bold">
              ${course.price.toFixed(2)}
            </Text>
          </View>
          {enrolled ? (
            <View className="flex-row items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2">
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <Text className="text-emerald-700 font-bold text-sm">
                Enrolled
              </Text>
            </View>
          ) : null}
        </View>

        <Button
          title={enrolled ? "Continue Learning" : "Enroll Now"}
          onPress={handleEnroll}
          loading={enrollLoading}
          disabled={enrolled}
          variant={enrolled ? "outline" : "primary"}
        />

        {/* View Content button — always visible */}
        <Pressable
          onPress={() => router.push(`/course/webview/${course.id}`)}
          className="mt-3 flex-row items-center justify-center gap-2 py-3"
        >
          <Ionicons name="play-circle-outline" size={18} color="#4F46E5" />
          <Text className="text-indigo-600 font-semibold text-sm">
            View Course Content
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
