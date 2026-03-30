import { EmptyState } from "@/components/common/EmptyState";
import { CourseCard } from "@/components/courses/CourseCard";
import { CourseCardSkeleton } from "@/components/courses/CourseCardSkeleton";
import { SearchBar } from "@/components/courses/SearchBar";
import { useAuthStore } from "@/stores/authStore";
import { useCourseStore } from "@/stores/courseStore";
import type { Course } from "@/types/course.types";
import { Ionicons } from "@expo/vector-icons";
import { LegendList } from "@legendapp/list";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CATEGORIES = [
  "All",
  "smartphones",
  "laptops",
  "fragrances",
  "skincare",
  "groceries",
];

export default function HomeScreen() {
  const { user } = useAuthStore();
  const {
    courses,
    bookmarks,
    isLoading,
    isRefreshing,
    isLoadingMore,
    error,
    hasMore,
    fetchCourses,
    fetchMoreCourses,
    clearError,
  } = useCourseStore();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const firstName = user?.username ?? "Learner";
  const bookmarkCount = bookmarks.size;

  // Initial fetch
  useEffect(() => {
    if (courses.length === 0) fetchCourses();
  }, []);

  // Filter logic — memoized to avoid re-computation on every render
  const filteredCourses = useMemo<Course[]>(() => {
    let result = courses;

    if (activeCategory !== "All") {
      result = result.filter(
        (c) => c.category.toLowerCase() === activeCategory.toLowerCase(),
      );
    }

    if (search.trim().length > 0) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          `${c.instructor.name.first} ${c.instructor.name.last}`
            .toLowerCase()
            .includes(q),
      );
    }

    return result;
  }, [courses, search, activeCategory]);

  const handleRefresh = useCallback(() => {
    fetchCourses(true);
  }, []);

  const handleEndReached = useCallback(() => {
    if (hasMore && !isLoadingMore) fetchMoreCourses();
  }, [hasMore, isLoadingMore]);

  const renderItem = useCallback(
    ({ item }: { item: Course }) => <CourseCard course={item} />,
    [],
  );

  const keyExtractor = useCallback((item: Course) => item.id.toString(), []);

  // ── Header component (rendered above the list) ──────────────────────────────
  const ListHeader = useMemo(
    () => (
      <View>
        {/* ── Greeting ── */}
        <View className="px-4 pt-4 pb-5">
          <View className="flex-row items-center justify-between mb-1">
            <View>
              <Text className="text-slate-400 text-sm font-medium">
                Good day 👋
              </Text>
              <Text className="text-slate-900 text-2xl font-bold capitalize">
                {firstName}
              </Text>
            </View>
            {/* Bookmark count badge */}
            <View className="bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-2 flex-row items-center gap-2">
              <Ionicons name="bookmark" size={16} color="#4F46E5" />
              <Text className="text-indigo-600 font-bold text-sm">
                {bookmarkCount}
              </Text>
              <Text className="text-indigo-400 text-xs">saved</Text>
            </View>
          </View>
        </View>

        {/* ── Search ── */}
        <View className="px-4 mb-4">
          <SearchBar value={search} onChangeText={setSearch} />
        </View>

        {/* ── Category Chips ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          className="mb-4"
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl border ${
                  isActive
                    ? "bg-indigo-600 border-indigo-600"
                    : "bg-white border-slate-200"
                }`}
              >
                <Text
                  className={`text-sm font-semibold capitalize ${
                    isActive ? "text-white" : "text-slate-600"
                  }`}
                >
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── Error Banner ── */}
        {error ? (
          <View className="mx-4 mb-4 bg-red-50 border border-red-200 rounded-2xl p-4 flex-row items-center gap-3">
            <Ionicons name="warning-outline" size={20} color="#EF4444" />
            <Text className="flex-1 text-red-600 text-sm">{error}</Text>
            <Pressable
              onPress={() => {
                clearError();
                fetchCourses();
              }}
              hitSlop={10}
            >
              <Text className="text-red-600 font-bold text-sm">Retry</Text>
            </Pressable>
          </View>
        ) : null}

        {/* ── Results count ── */}
        {!isLoading && courses.length > 0 ? (
          <View className="px-4 mb-3">
            <Text className="text-slate-400 text-xs font-medium">
              {filteredCourses.length} course
              {filteredCourses.length !== 1 ? "s" : ""} found
            </Text>
          </View>
        ) : null}
      </View>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      firstName,
      bookmarkCount,
      search,
      activeCategory,
      error,
      filteredCourses.length,
      isLoading,
    ],
  );

  const ListFooter = useMemo(
    () =>
      isLoadingMore ? (
        <View className="py-6 items-center">
          <ActivityIndicator size="small" color="#4F46E5" />
        </View>
      ) : !hasMore && courses.length > 0 ? (
        <View className="py-6 items-center">
          <Text className="text-slate-400 text-xs">
            You ve seen all {courses.length} courses 🎉
          </Text>
        </View>
      ) : null,
    [isLoadingMore, hasMore, courses.length],
  );

  // ── Skeleton loading state ───────────────────────────────────────────────────
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <View className="px-4 pt-4 pb-5">
          <Text className="text-slate-900 text-2xl font-bold">Courses</Text>
        </View>
        {Array.from({ length: 4 }).map((_, i) => (
          <CourseCardSkeleton key={i} />
        ))}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <LegendList
        data={filteredCourses}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        estimatedItemSize={290}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={
          search.length > 0 || activeCategory !== "All" ? (
            <EmptyState
              icon="search-outline"
              title="No courses found"
              description={`Try adjusting your search or filters`}
              actionLabel="Clear filters"
              onAction={() => {
                setSearch("");
                setActiveCategory("All");
              }}
            />
          ) : (
            <EmptyState
              icon="library-outline"
              title="No courses yet"
              description="Pull down to load courses"
              actionLabel="Load Courses"
              onAction={() => fetchCourses()}
            />
          )
        }
        onRefresh={handleRefresh}
        refreshing={isRefreshing}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        recycleItems
      />
    </SafeAreaView>
  );
}
