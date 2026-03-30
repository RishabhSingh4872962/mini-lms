import { EmptyState } from "@/components/common/EmptyState";
import { CourseCard } from "@/components/courses/CourseCard";
import { useCourseStore } from "@/stores/courseStore";
import type { Course } from "@/types/course.types";
import { LegendList } from "@legendapp/list";
import { router } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BookmarksScreen() {
  const { courses, bookmarks } = useCourseStore();

  const bookmarkedCourses = useMemo<Course[]>(
    () => courses.filter((c) => bookmarks.has(c.id)),
    [courses, bookmarks],
  );

  const renderItem = useCallback(
    ({ item }: { item: Course }) => <CourseCard course={item} />,
    [],
  );

  const keyExtractor = useCallback((item: Course) => item.id.toString(), []);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <LegendList
        data={bookmarkedCourses}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        estimatedItemSize={290}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        recycleItems
        ListHeaderComponent={
          <View className="px-4 pt-4 pb-5">
            <Text className="text-slate-900 text-2xl font-bold">
              Saved Courses
            </Text>
            <Text className="text-slate-400 text-sm mt-1">
              {bookmarkedCourses.length} course
              {bookmarkedCourses.length !== 1 ? "s" : ""} saved
            </Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="bookmark-outline"
            title="Nothing saved yet"
            description="Bookmark courses from the home screen to find them here quickly."
            actionLabel="Browse Courses"
            onAction={() => router.push("/(tabs)")}
          />
        }
      />
    </SafeAreaView>
  );
}
