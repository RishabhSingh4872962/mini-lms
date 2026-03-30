import { EmptyState } from "@/components/common/EmptyState";
import { useNetwork } from "@/components/common/NetworkStatusProvider";
import { useRetry } from "@/hooks/useRetry";
import { useCourseStore } from "@/stores/courseStore";
import type { Course } from "@/types/course.types";
import { Ionicons } from "@expo/vector-icons";
import { LegendList } from "@legendapp/list";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ── Recent search persistence (in-memory for this session) ───────────────────
let recentSearchesCache: string[] = [];
const MAX_RECENT = 6;

function addRecentSearch(query: string) {
  recentSearchesCache = [
    query,
    ...recentSearchesCache.filter((q) => q !== query),
  ].slice(0, MAX_RECENT);
}

// ── Filter types ─────────────────────────────────────────────────────────────
type SortOption = "relevance" | "price_asc" | "price_desc" | "rating";
type LevelFilter = "All" | "Beginner" | "Intermediate" | "Advanced";

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: "relevance", label: "Relevance" },
  { key: "rating", label: "Top Rated" },
  { key: "price_asc", label: "Price: Low" },
  { key: "price_desc", label: "Price: High" },
];

const LEVEL_FILTERS: LevelFilter[] = [
  "All",
  "Beginner",
  "Intermediate",
  "Advanced",
];

// ── Score a course for relevance to a query ───────────────────────────────────
function scoreMatch(course: Course, query: string): number {
  const q = query.toLowerCase();
  let score = 0;
  if (course.title.toLowerCase().includes(q)) score += 3;
  if (course.category.toLowerCase().includes(q)) score += 2;
  if (course.description.toLowerCase().includes(q)) score += 1;
  const instructor =
    `${course.instructor.name.first} ${course.instructor.name.last}`.toLowerCase();
  if (instructor.includes(q)) score += 2;
  return score;
}

// ── Highlighted text component ─────────────────────────────────────────────
function HighlightedText({
  text,
  query,
  className,
  numberOfLines,
}: {
  text: string;
  query: string;
  className?: string;
  numberOfLines?: number;
}) {
  if (!query.trim()) {
    return (
      <Text className={className} numberOfLines={numberOfLines}>
        {text}
      </Text>
    );
  }

  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi",
  );
  const parts = text.split(regex);

  return (
    <Text className={className} numberOfLines={numberOfLines}>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <Text key={i} className="text-indigo-600 font-bold bg-indigo-50">
            {part}
          </Text>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </Text>
  );
}

// ── Compact search result card ────────────────────────────────────────────────
const SearchResultCard = React.memo(function SearchResultCard({
  course,
  query,
}: {
  course: Course;
  query: string;
}) {
  const instructorName = `${course.instructor.name.first} ${course.instructor.name.last}`;

  return (
    <Pressable
      onPress={() => router.push(`/course/${course.id}`)}
      className="flex-row bg-white mx-4 mb-2.5 rounded-2xl overflow-hidden border border-slate-100 active:opacity-90"
      style={{ elevation: 1 }}
    >
      <Image
        source={{ uri: course.thumbnail }}
        style={{ width: 90, height: 90 }}
        contentFit="cover"
      />
      <View className="flex-1 px-3 py-2.5 justify-between">
        <HighlightedText
          text={course.title}
          query={query}
          className="text-slate-900 font-bold text-sm leading-tight"
          numberOfLines={2}
        />
        <View className="flex-row items-center gap-1 mt-1">
          <Ionicons name="person-circle-outline" size={12} color="#94A3B8" />
          <Text className="text-slate-400 text-xs flex-1" numberOfLines={1}>
            {instructorName}
          </Text>
        </View>
        <View className="flex-row items-center justify-between mt-1">
          <View className="flex-row items-center gap-1">
            <Ionicons name="star" size={11} color="#F59E0B" />
            <Text className="text-slate-600 text-xs font-semibold">
              {course.rating}
            </Text>
          </View>
          <Text className="text-indigo-600 font-bold text-sm">
            ${course.price.toFixed(2)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
});

// ── Main Screen ──────────────────────────────────────────────────────────────
export default function SearchScreen() {
  const { courses, isLoading, error, fetchCourses, clearError } =
    useCourseStore();
  const { isConnected, isInternetReachable } = useNetwork();
  const isOffline = !isConnected || !isInternetReachable;

  const [query, setQuery] = useState("");
  const [activeSort, setActiveSort] = useState<SortOption>("relevance");
  const [activeLevel, setActiveLevel] = useState<LevelFilter>("All");
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] =
    useState<string[]>(recentSearchesCache);
  const [submittedQuery, setSubmittedQuery] = useState("");

  const inputRef = useRef<TextInput>(null);
  const filtersHeight = useRef(new Animated.Value(0)).current;

  const { attempt, isRetrying, attemptCount, lastError } = useRetry({
    maxAttempts: 3,
    baseDelayMs: 800,
    onSuccess: clearError,
  });

  // Load courses on mount if not loaded
  useEffect(() => {
    if (courses.length === 0 && !isLoading) {
      attempt(() => fetchCourses());
    }
  }, []);

  // Animate filter panel
  useEffect(() => {
    Animated.spring(filtersHeight, {
      toValue: showFilters ? 1 : 0,
      useNativeDriver: false,
      tension: 80,
      friction: 10,
    }).start();
  }, [showFilters]);

  const filterPanelHeight = filtersHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 130],
  });

  // ── Filtered + sorted results ─────────────────────────────────────────────
  const results = useMemo<Course[]>(() => {
    const q = submittedQuery.trim().toLowerCase();
    let pool = [...courses];

    // Level filter
    if (activeLevel !== "All") {
      pool = pool.filter((c) => c.level === activeLevel);
    }

    // Text search — only when query submitted
    if (q) {
      pool = pool
        .map((c) => ({ course: c, score: scoreMatch(c, q) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => (activeSort === "relevance" ? b.score - a.score : 0))
        .map(({ course }) => course);
    }

    // Sort
    switch (activeSort) {
      case "price_asc":
        pool.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        pool.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        pool.sort((a, b) => b.rating - a.rating);
        break;
    }

    return pool;
  }, [courses, submittedQuery, activeSort, activeLevel]);

  const handleSubmit = useCallback(() => {
    const q = query.trim();
    if (!q) return;
    setSubmittedQuery(q);
    addRecentSearch(q);
    setRecentSearches([...recentSearchesCache]);
  }, [query]);

  const handleRecentTap = useCallback((q: string) => {
    setQuery(q);
    setSubmittedQuery(q);
    inputRef.current?.blur();
  }, []);

  const handleClear = useCallback(() => {
    setQuery("");
    setSubmittedQuery("");
    inputRef.current?.focus();
  }, []);

  const handleRetry = useCallback(() => {
    clearError();
    attempt(() => fetchCourses());
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Course }) => (
      <SearchResultCard course={item} query={submittedQuery} />
    ),
    [submittedQuery],
  );

  const keyExtractor = useCallback((item: Course) => item.id.toString(), []);

  const isSearchActive = submittedQuery.length > 0;
  const hasActiveFilters = activeLevel !== "All" || activeSort !== "relevance";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* ── Top Search Bar ── */}
      <View className="px-4 pt-4 pb-3 bg-slate-50">
        <Text className="text-slate-900 text-2xl font-bold mb-3">Search</Text>

        <View className="flex-row gap-2">
          {/* Input */}
          <View className="flex-1 flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 h-12 gap-3">
            <Ionicons name="search-outline" size={20} color="#94A3B8" />
            <TextInput
              ref={inputRef}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSubmit}
              placeholder="Courses, topics, instructors…"
              placeholderTextColor="#94A3B8"
              className="flex-1 text-slate-900 text-base"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {query.length > 0 ? (
              <Pressable onPress={handleClear} hitSlop={10}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </Pressable>
            ) : null}
          </View>

          {/* Filter toggle */}
          <Pressable
            onPress={() => setShowFilters((v) => !v)}
            className={`w-12 h-12 rounded-2xl items-center justify-center ${
              hasActiveFilters
                ? "bg-indigo-600"
                : "bg-white border border-slate-200"
            }`}
          >
            <Ionicons
              name="options-outline"
              size={20}
              color={hasActiveFilters ? "white" : "#64748B"}
            />
            {hasActiveFilters ? (
              <View className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
            ) : null}
          </Pressable>
        </View>

        {/* ── Animated filter panel ── */}
        <Animated.View
          style={{ height: filterPanelHeight, overflow: "hidden" }}
        >
          <View className="pt-3 gap-3">
            {/* Level filter */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {LEVEL_FILTERS.map((level) => (
                <Pressable
                  key={level}
                  onPress={() => setActiveLevel(level)}
                  className={`px-4 py-2 rounded-xl border ${
                    activeLevel === level
                      ? "bg-indigo-600 border-indigo-600"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      activeLevel === level ? "text-white" : "text-slate-600"
                    }`}
                  >
                    {level}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Sort options */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {SORT_OPTIONS.map(({ key, label }) => (
                <Pressable
                  key={key}
                  onPress={() => setActiveSort(key)}
                  className={`flex-row items-center gap-1.5 px-4 py-2 rounded-xl border ${
                    activeSort === key
                      ? "bg-slate-900 border-slate-900"
                      : "bg-white border-slate-200"
                  }`}
                >
                  {activeSort === key ? (
                    <Ionicons name="checkmark" size={13} color="white" />
                  ) : null}
                  <Text
                    className={`text-sm font-semibold ${
                      activeSort === key ? "text-white" : "text-slate-600"
                    }`}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Animated.View>
      </View>

      {/* ── Offline banner ── */}
      {isOffline ? (
        <View className="mx-4 mb-3 bg-amber-50 border border-amber-200 rounded-2xl p-3 flex-row items-center gap-3">
          <Ionicons name="cloud-offline-outline" size={18} color="#D97706" />
          <Text className="text-amber-700 text-sm font-medium flex-1">
            You are offline. Showing cached results.
          </Text>
        </View>
      ) : null}

      {/* ── Error + Retry ── */}
      {(error || lastError) && !isOffline ? (
        <View className="mx-4 mb-3 bg-red-50 border border-red-200 rounded-2xl p-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Ionicons name="warning-outline" size={18} color="#EF4444" />
            <Text className="text-red-700 font-bold text-sm flex-1">
              {error ?? lastError}
            </Text>
          </View>
          <Pressable
            onPress={handleRetry}
            disabled={isRetrying}
            className="flex-row items-center gap-2 self-start bg-red-100 px-4 py-2 rounded-xl active:bg-red-200"
          >
            {isRetrying ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <Ionicons name="refresh-outline" size={16} color="#EF4444" />
            )}
            <Text className="text-red-600 text-sm font-bold">
              {isRetrying ? `Retrying… (${attemptCount}/3)` : "Retry"}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {/* ── Body ── */}
      {!isSearchActive ? (
        // ── Pre-search: recent + suggestions ──────────────────────────────────
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {/* Recent searches */}
          {recentSearches.length > 0 ? (
            <View className="px-4 mb-5">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-slate-900 font-bold text-base">
                  Recent
                </Text>
                <Pressable
                  onPress={() => {
                    recentSearchesCache = [];
                    setRecentSearches([]);
                  }}
                  hitSlop={10}
                >
                  <Text className="text-indigo-600 text-sm font-semibold">
                    Clear
                  </Text>
                </Pressable>
              </View>
              <View className="gap-1">
                {recentSearches.map((q) => (
                  <Pressable
                    key={q}
                    onPress={() => handleRecentTap(q)}
                    className="flex-row items-center gap-3 py-3 border-b border-slate-50 active:bg-slate-50 rounded-xl px-1"
                  >
                    <View className="w-8 h-8 bg-slate-100 rounded-xl items-center justify-center">
                      <Ionicons name="time-outline" size={16} color="#94A3B8" />
                    </View>
                    <Text className="flex-1 text-slate-700 text-sm font-medium">
                      {q}
                    </Text>
                    <Pressable
                      onPress={() => {
                        recentSearchesCache = recentSearchesCache.filter(
                          (r) => r !== q,
                        );
                        setRecentSearches([...recentSearchesCache]);
                      }}
                      hitSlop={10}
                    >
                      <Ionicons name="close" size={16} color="#CBD5E1" />
                    </Pressable>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          {/* Trending topics */}
          <View className="px-4">
            <Text className="text-slate-900 font-bold text-base mb-3">
              Browse Topics
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {[
                "smartphones",
                "laptops",
                "skincare",
                "fragrances",
                "groceries",
                "lighting",
                "furniture",
                "tops",
              ].map((topic) => (
                <Pressable
                  key={topic}
                  onPress={() => {
                    setQuery(topic);
                    setSubmittedQuery(topic);
                    addRecentSearch(topic);
                    setRecentSearches([...recentSearchesCache]);
                  }}
                  className="flex-row items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 active:bg-indigo-50 active:border-indigo-200"
                >
                  <Ionicons
                    name="trending-up-outline"
                    size={14}
                    color="#94A3B8"
                  />
                  <Text className="text-slate-600 text-sm font-semibold capitalize">
                    {topic}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : (
        // ── Results list ──────────────────────────────────────────────────────
        <View className="flex-1">
          {/* Results header */}
          <View className="flex-row items-center justify-between px-4 pb-3">
            <Text className="text-slate-500 text-xs font-medium">
              {results.length} result{results.length !== 1 ? "s" : ""} for{" "}
              <Text className="text-slate-900 font-bold">{submittedQuery}</Text>
            </Text>
            {isLoading ? (
              <ActivityIndicator size="small" color="#4F46E5" />
            ) : null}
          </View>

          <LegendList
            data={results}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            estimatedItemSize={110}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 24 }}
            recycleItems
            ListEmptyComponent={
              <EmptyState
                icon="search-outline"
                title={`No results for "${submittedQuery}"`}
                description="Try a different keyword or browse topics below"
                actionLabel="Clear search"
                onAction={handleClear}
              />
            }
          />
        </View>
      )}
    </SafeAreaView>
  );
}
