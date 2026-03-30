import { authApi } from "@/api/auth";
import { tokenStorage } from "@/lib/secureStore";
import type { LoginRequest, RegisterRequest, User } from "@/types/auth.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isCheckingAuth: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (payload: Omit<RegisterRequest, "role">) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response &&
    error.response.data &&
    typeof error.response.data === "object" &&
    "message" in error.response.data
  ) {
    return String(error.response.data.message);
  }
  return fallback;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isCheckingAuth: true,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(credentials);
          const { user, accessToken, refreshToken } = response.data;
          await tokenStorage.setTokens(accessToken, refreshToken);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({
            error: extractErrorMessage(
              error,
              "Login failed. Please try again.",
            ),
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(payload);
          const { user } = response.data;

          get().login({
            username: payload.username,
            password: payload.password,
          });
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({
            error: extractErrorMessage(
              error,
              "Registration failed. Please try again.",
            ),
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // Silent — clear local state regardless
        } finally {
          await tokenStorage.clearTokens();
          set({ user: null, isAuthenticated: false, error: null });
        }
      },

      checkAuth: async () => {
        set({ isCheckingAuth: true });
        const token = await tokenStorage.getAccessToken();

        if (!token) {
          set({ isAuthenticated: false, isCheckingAuth: false });
          return;
        }

        try {
          const response = await authApi.getCurrentUser();
          set({
            user: response.data,
            isAuthenticated: true,
            isCheckingAuth: false,
          });
        } catch {
          await tokenStorage.clearTokens();
          set({ user: null, isAuthenticated: false, isCheckingAuth: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "lms-auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist non-sensitive data — tokens live in SecureStore
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
