import { coursesApi } from "@/api/courses";
import {
  scheduleBookmarkMilestoneNotification,
  scheduleReminderNotification,
} from "@/lib/notifications";
import type { Course, RawProduct, RawUser } from "@/types/course.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// ── Deterministic synthetic data from course id ──────────────────────────────
const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
const DURATIONS = [
  "4h 30m",
  "6h 15m",
  "8h 00m",
  "10h 45m",
  "12h 20m",
  "3h 50m",
];

const COURSE_IMAGES: string[] = [
  "https://img-c.udemycdn.com/course/750x422/1565838_e54e_16.jpg",
  "https://img-c.udemycdn.com/course/750x422/950390_270f_3.jpg",
  "https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://images.coursera.org/CS50x.jpg",
  "https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://images.coursera.org/python.jpg",
  "https://miro.medium.com/v2/resize:fit:1200/1*eKZ8Zr1v8Rk8zqRLVQjaxA.png",
  "https://cdn.fs.teachablecdn.com/4Rk2X6vR3KpW5Xx8c2bA",
  "https://cdn.educba.com/academy/wp-content/uploads/2019/03/Data-Science-Course.jpg",
  "https://cdn.udacity.com/course-catalog-images/nd001.jpg",
  "https://cdn.udacity.com/course-catalog-images/nd0044.jpg",
  "https://pluralsight.imgix.net/paths/path-icons/react-17a7fdf8a9.png",
];

function getCourseImage(id: number): string {
  return COURSE_IMAGES[id % COURSE_IMAGES.length];
}

function syntheticCourseData(id: number) {
  return {
    rating: Number((3.5 + (id % 15) * 0.1).toFixed(1)),
    reviewCount: 120 + ((id * 37) % 4880),
    duration: DURATIONS[id % DURATIONS.length],
    studentsCount: 500 + ((id * 113) % 49500),
    level: LEVELS[id % 3],
  };
}

// ── Merge products + users into Course objects ────────────────────────────────
function mergeCourses(products: RawProduct[], users: RawUser[]): Course[] {
  return products.map((product, index) => {
    const user = users[index % users.length];
    return {
      ...product,
      thumbnail: getCourseImage(index),
      instructor: {
        id: user.id,
        name: user.name,
        picture: user.picture,
        email: user.email,
        location: user.location,
      },
      ...syntheticCourseData(product.id),
    };
  });
}

// ── Store types ───────────────────────────────────────────────────────────────
interface CourseState {
  courses: Course[];
  bookmarks: Set<number>;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;

  fetchCourses: (refresh?: boolean) => Promise<void>;
  fetchMoreCourses: () => Promise<void>;
  toggleBookmark: (courseId: number) => void;
  isBookmarked: (courseId: number) => boolean;
  getCourseById: (id: number) => Course | undefined;
  clearError: () => void;
}

const ITEMS_PER_PAGE = 10;

// Zustand doesn't natively persist Sets — we serialize to array
interface PersistedState {
  bookmarksArray: number[];
}

export const useCourseStore = create<CourseState>()(
  persist(
    (set, get) => ({
      courses: [],
      bookmarks: new Set<number>(),
      isLoading: false,
      isRefreshing: false,
      isLoadingMore: false,
      error: null,
      currentPage: 1,
      totalPages: 1,
      hasMore: true,

      fetchCourses: async (refresh = false) => {
        const state = get();
        if (state.isLoading || state.isRefreshing) return;

        set(
          refresh
            ? { isRefreshing: true, error: null }
            : { isLoading: true, error: null },
        );

        try {
          const [productsRes, usersRes] = await Promise.all([
            coursesApi.getProducts({ page: 1, limit: ITEMS_PER_PAGE }),
            coursesApi.getInstructors({ page: 1, limit: ITEMS_PER_PAGE }),
          ]);

          const merged = mergeCourses(productsRes.data, usersRes.data);

          set({
            courses: merged,
            currentPage: 1,
            totalPages: productsRes.totalPages,
            hasMore: productsRes.nextPage,
            isLoading: false,
            isRefreshing: false,
          });

          // Schedule a 24h reminder whenever user refreshes/opens
          await scheduleReminderNotification();
        } catch (err: unknown) {
          const message =
            err && typeof err === "object" && "message" in err
              ? String((err as { message: string }).message)
              : "Failed to load courses. Please try again.";
          set({ error: message, isLoading: false, isRefreshing: false });
        }
      },

      fetchMoreCourses: async () => {
        const state = get();
        if (state.isLoadingMore || state.isLoading || !state.hasMore) return;

        const nextPage = state.currentPage + 1;
        set({ isLoadingMore: true });

        try {
          const [productsRes, usersRes] = await Promise.all([
            coursesApi.getProducts({ page: nextPage, limit: ITEMS_PER_PAGE }),
            coursesApi.getInstructors({
              page: nextPage,
              limit: ITEMS_PER_PAGE,
            }),
          ]);

          const merged = mergeCourses(productsRes.data, usersRes.data);

          set((s) => ({
            courses: [...s.courses, ...merged],
            currentPage: nextPage,
            totalPages: productsRes.totalPages,
            hasMore: productsRes.nextPage,
            isLoadingMore: false,
          }));
        } catch {
          set({ isLoadingMore: false });
        }
      },

      toggleBookmark: (courseId) => {
        set((state) => {
          const next = new Set(state.bookmarks);
          if (next.has(courseId)) {
            next.delete(courseId);
          } else {
            next.add(courseId);
            // Fire milestone notification at 5 bookmarks
            if (next.size === 5) {
              scheduleBookmarkMilestoneNotification();
            }
          }
          return { bookmarks: next };
        });
      },

      isBookmarked: (courseId) => get().bookmarks.has(courseId),

      getCourseById: (id) => get().courses.find((c) => c.id === id),

      clearError: () => set({ error: null }),
    }),
    {
      name: "lms-course-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Serialize Set → array for persistence
      partialize: (state): PersistedState => ({
        bookmarksArray: Array.from(state.bookmarks),
      }),
      // Deserialize array → Set on rehydration
      merge: (persisted, current) => ({
        ...current,
        bookmarks: new Set((persisted as PersistedState).bookmarksArray ?? []),
      }),
    },
  ),
);
