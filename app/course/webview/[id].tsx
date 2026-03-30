import { generateCourseHtml } from "@/lib/courseHtmlTemplate";
import { useCourseStore } from "@/stores/courseStore";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    BackHandler,
    Pressable,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView, {
    type WebViewMessageEvent,
    type WebViewNavigation,
} from "react-native-webview";


// Message types from WebView → Native
type WebViewMessage =
  | { type: "ENROLL"; payload: { courseId: number } }
  | {
      type: "LESSON_PROGRESS";
      payload: {
        completedCount: number;
        totalCount: number;
        percentage: number;
      };
    }
  | { type: "READY" };

export default function CourseWebViewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCourseById, toggleBookmark, isBookmarked } = useCourseStore();

  const course = getCourseById(Number(id));
  const bookmarked = isBookmarked(Number(id));

  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [canGoBack, setCanGoBack] = useState(false);

  // ── Hardware back button — navigate in WebView if possible ──────────────────
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          if (canGoBack && webViewRef.current) {
            webViewRef.current.goBack();
            return true;
          }
          return false;
        },
      );
      return () => subscription.remove();
    }, [canGoBack]),
  );

  // ── Inject course data after WebView loads ───────────────────────────────────
  const injectCourseData = useCallback(() => {
    if (!course || !webViewRef.current) return;

    const payload = {
      type: "COURSE_DATA",
      payload: {
        id: course.id,
        title: course.title,
        description: course.description,
        price: course.price,
        category: course.category,
        thumbnail: course.thumbnail,
        level: course.level,
        rating: course.rating,
        reviewCount: course.reviewCount,
        duration: course.duration,
        studentsCount: course.studentsCount,
        isEnrolled: false,
        instructor: {
          name: course.instructor.name,
          picture: course.instructor.picture,
          location: course.instructor.location,
        },
      },
    };

    const js = `
      (function() {
        window.dispatchEvent(new MessageEvent('message', {
          data: ${JSON.stringify(JSON.stringify(payload))}
        }));
      })();
      true;
    `;

    webViewRef.current.injectJavaScript(js);
  }, [course]);

  // ── Handle messages from WebView → Native ───────────────────────────────────
  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const msg: WebViewMessage = JSON.parse(event.nativeEvent.data);

        switch (msg.type) {
          case "ENROLL":
            Alert.alert(
              "🎉 Enrollment Confirmed",
              `You have successfully enrolled in "${course?.title}"!`,
              [{ text: "Awesome!", style: "default" }],
            );
            break;

          case "LESSON_PROGRESS":
            setProgress(msg.payload.percentage);
            break;
        }
      } catch {
        // Malformed message — ignore
      }
    },
    [course],
  );

  // ── Notify WebView when native bookmark changes ──────────────────────────────
  const handleBookmarkPress = useCallback(() => {
    toggleBookmark(Number(id));
    const nextBookmarked = !bookmarked;

    const js = `
      (function() {
        window.dispatchEvent(new MessageEvent('message', {
          data: ${JSON.stringify(
            JSON.stringify({
              type: "TOGGLE_BOOKMARK",
              payload: { bookmarked: nextBookmarked },
            }),
          )}
        }));
      })();
      true;
    `;
    webViewRef.current?.injectJavaScript(js);
  }, [id, bookmarked, toggleBookmark]);

  const handleNavigationStateChange = useCallback(
    (state: WebViewNavigation) => {
      setCanGoBack(state.canGoBack);
    },
    [],
  );

  const handleRetry = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
    webViewRef.current?.reload();
  }, []);

  if (!course) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={48} color="#94A3B8" />
        <Text className="text-slate-900 text-xl font-bold mt-4 mb-2">
          Course not found
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="bg-indigo-600 px-8 py-3 rounded-2xl mt-4"
        >
          <Text className="text-white font-bold">Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* ── Top Bar ── */}
      <SafeAreaView
        edges={["top"]}
        className="bg-white border-b border-slate-100"
      >
        <View className="flex-row items-center px-4 py-3 gap-3">
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            className="w-9 h-9 items-center justify-center rounded-xl bg-slate-100"
          >
            <Ionicons name="arrow-back" size={20} color="#1E293B" />
          </Pressable>

          <View className="flex-1">
            <Text
              className="text-slate-900 font-bold text-sm"
              numberOfLines={1}
            >
              {course.title}
            </Text>
            {progress > 0 ? (
              <Text className="text-indigo-600 text-xs font-medium">
                {progress}% complete
              </Text>
            ) : (
              <Text className="text-slate-400 text-xs">Course Content</Text>
            )}
          </View>

          <Pressable
            onPress={handleBookmarkPress}
            hitSlop={10}
            className="w-9 h-9 items-center justify-center rounded-xl bg-slate-100"
          >
            <Ionicons
              name={bookmarked ? "bookmark" : "bookmark-outline"}
              size={18}
              color={bookmarked ? "#4F46E5" : "#64748B"}
            />
          </Pressable>
        </View>

        {/* ── Progress bar under header ── */}
        {progress > 0 ? (
          <View className="h-1 bg-slate-100">
            <View
              className="h-full bg-indigo-500"
              style={{ width: `${progress}%` }}
            />
          </View>
        ) : null}
      </SafeAreaView>

      {/* ── WebView ── */}
      <View className="flex-1">
        {!hasError ? (
          <WebView
            ref={webViewRef}
            source={{
              html: generateCourseHtml(),
              baseUrl: "https://learnhub.app",
            }}
            onLoad={() => {
              setIsLoading(false);
              // Small delay to ensure the page scripts are ready
              setTimeout(injectCourseData, 200);
            }}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            onHttpError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            onMessage={handleMessage}
            onNavigationStateChange={handleNavigationStateChange}
            javaScriptEnabled
            domStorageEnabled
            allowsBackForwardNavigationGestures
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            // Security: only allow same origin navigation
            originWhitelist={["*"]}
            // Pass app context as custom header (Native → WebView via headers)
            injectedJavaScriptBeforeContentLoaded={`
              window.__LMS_CONTEXT__ = {
                platform: 'mobile',
                courseId: ${course.id},
                appVersion: '1.0.0',
              };
              true;
            `}
          />
        ) : null}

        {/* ── Loading overlay ── */}
        {isLoading && !hasError ? (
          <View className="absolute inset-0 bg-white items-center justify-center gap-4">
            <View className="w-16 h-16 bg-indigo-50 rounded-3xl items-center justify-center">
              <ActivityIndicator size="large" color="#4F46E5" />
            </View>
            <Text className="text-slate-500 text-sm">
              Loading course content…
            </Text>
          </View>
        ) : null}

        {/* ── Error State ── */}
        {hasError ? (
          <View className="flex-1 bg-slate-50 items-center justify-center px-8">
            <View className="w-20 h-20 bg-red-50 rounded-3xl items-center justify-center mb-5">
              <Ionicons name="wifi-outline" size={36} color="#EF4444" />
            </View>
            <Text className="text-slate-900 text-xl font-bold text-center mb-2">
              Failed to load content
            </Text>
            <Text className="text-slate-500 text-sm text-center leading-relaxed mb-6">
              Something went wrong loading the course content. Check your
              connection and try again.
            </Text>
            <Pressable
              onPress={handleRetry}
              className="bg-indigo-600 px-8 py-3.5 rounded-2xl flex-row items-center gap-2"
            >
              <Ionicons name="refresh-outline" size={18} color="white" />
              <Text className="text-white font-bold">Try Again</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  );
}
