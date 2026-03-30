import { useCourseStore } from "@/stores/courseStore";
import type { Course } from "@/types/course.types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";

interface CourseCardProps {
  course: Course;
}

const LEVEL_COLORS: Record<string, string> = {
  Beginner: "bg-emerald-100 text-emerald-700",
  Intermediate: "bg-amber-100 text-amber-700",
  Advanced: "bg-red-100 text-red-700",
};

function formatStudents(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
}

export const CourseCard = memo(function CourseCard({
  course,
}: CourseCardProps) {
  const { toggleBookmark, isBookmarked } = useCourseStore();
  const bookmarked = isBookmarked(course.id);
  const instructorName = `${course.instructor.name.first} ${course.instructor.name.last}`;
  const levelStyle = LEVEL_COLORS[course.level] ?? LEVEL_COLORS.Beginner;

  return (
    <Pressable
      onPress={() => router.push(`/course/${course.id}`)}
      className="bg-white mx-4 mb-3 rounded-3xl overflow-hidden border border-slate-100 active:opacity-90"
      style={{ elevation: 2 }}
    >
      {/* ── Thumbnail ── */}
      <View className="relative">
        <Image
          source={{ uri: course.thumbnail }}
          style={{ width: "100%", height: 160 }}
          contentFit="cover"
          transition={300}
        />

        {/* Bookmark button */}
        <Pressable
          onPress={() => toggleBookmark(course.id)}
          hitSlop={8}
          className="absolute top-3 right-3 bg-white/90 rounded-xl w-9 h-9 items-center justify-center"
          style={{ elevation: 3 }}
        >
          <Ionicons
            name={bookmarked ? "bookmark" : "bookmark-outline"}
            size={18}
            color={bookmarked ? "#4F46E5" : "#64748B"}
          />
        </Pressable>

        {/* Category badge */}
        <View className="absolute bottom-3 left-3 bg-black/50 rounded-xl px-3 py-1">
          <Text className="text-white text-xs font-semibold capitalize">
            {course.category}
          </Text>
        </View>
      </View>

      {/* ── Content ── */}
      <View className="p-4">
        {/* Level + Duration row */}
        <View className="flex-row items-center gap-2 mb-2">
          <View
            className={`px-2 py-0.5 rounded-lg ${levelStyle.split(" ")[0]}`}
          >
            <Text
              className={`text-xs font-semibold ${levelStyle.split(" ")[1]}`}
            >
              {course.level}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="time-outline" size={12} color="#94A3B8" />
            <Text className="text-slate-400 text-xs">{course.duration}</Text>
          </View>
        </View>

        {/* Title */}
        <Text
          className="text-slate-900 font-bold text-base leading-tight mb-3"
          numberOfLines={2}
        >
          {course.title}
        </Text>

        {/* Instructor row */}
        <View className="flex-row items-center gap-2 mb-3">
          <Image
            source={{ uri: course.instructor.picture.thumbnail }}
            style={{ width: 24, height: 24, borderRadius: 12 }}
            contentFit="cover"
          />
          <Text className="text-slate-500 text-xs flex-1" numberOfLines={1}>
            {instructorName}
          </Text>
        </View>

        {/* Footer: rating + students + price */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            {/* Rating */}
            <View className="flex-row items-center gap-1">
              <Ionicons name="star" size={13} color="#F59E0B" />
              <Text className="text-slate-700 text-xs font-bold">
                {course.rating}
              </Text>
              <Text className="text-slate-400 text-xs">
                ({course.reviewCount})
              </Text>
            </View>

            {/* Students */}
            <View className="flex-row items-center gap-1">
              <Ionicons name="people-outline" size={13} color="#94A3B8" />
              <Text className="text-slate-400 text-xs">
                {formatStudents(course.studentsCount)}
              </Text>
            </View>
          </View>

          {/* Price */}
          <Text className="text-indigo-600 font-bold text-base">
            ${course.price.toFixed(2)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
});
