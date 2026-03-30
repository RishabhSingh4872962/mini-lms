import {
  API_BASE_URL,
  API_MAX_RETRIES,
  API_TIMEOUT,
  ENDPOINTS,
} from "@/constants/api";
import { tokenStorage } from "@/lib/secureStore";
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

// Augment config to support retry tracking
interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
}

//[] Queue for requests that fail while a token refresh is in progress
let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token!);
  });
  failedQueue = [];
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await tokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig;

    if (!originalRequest) return Promise.reject(error);

    // ── Token refresh on 401 ──
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await tokenStorage.getRefreshToken();
        if (!refreshToken) throw new Error("No refresh token available");

        const { data } = await axios.post(
          `${API_BASE_URL}${ENDPOINTS.AUTH.REFRESH_TOKEN}`,
          { refreshToken },
        );

        const newAccessToken: string = data.data.accessToken;
        const newRefreshToken: string = data.data.refreshToken;

        await tokenStorage.setTokens(newAccessToken, newRefreshToken);
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await tokenStorage.clearTokens();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ── Exponential-backoff retry for network errors ──
    if (!error.response) {
      originalRequest._retryCount = (originalRequest._retryCount ?? 0) + 1;

      if (originalRequest._retryCount <= API_MAX_RETRIES) {
        const delay = Math.pow(2, originalRequest._retryCount) * 500;
        await new Promise((res) => setTimeout(res, delay));
        return apiClient(originalRequest);
      }
    }

    return Promise.reject(error);
  },
);

// Human-readable error extraction used across the app
export function parseApiError(error: unknown): string {
  if (!error || typeof error !== "object")
    return "An unexpected error occurred.";

  // Axios error with response
  if ("response" in error) {
    const res = (
      error as { response?: { status?: number; data?: { message?: string } } }
    ).response;
    if (!res) return "No response from server. Check your connection.";

    const msg = res.data?.message;
    switch (res.status) {
      case 400:
        return msg ?? "Invalid request.";
      case 401:
        return "Session expired. Please sign in again.";
      case 403:
        return "You don't have permission to do that.";
      case 404:
        return msg ?? "Resource not found.";
      case 409:
        return msg ?? "Conflict. This may already exist.";
      case 422:
        return msg ?? "Validation error.";
      case 429:
        return "Too many requests. Please slow down.";
      case 500:
        return "Server error. Try again later.";
      default:
        return msg ?? `Error ${res.status}. Please try again.`;
    }
  }

  // Network-level error (no response)
  if ("code" in error) {
    const code = (error as { code: string }).code;
    if (code === "ECONNABORTED")
      return "Request timed out. Check your connection.";
    if (code === "ERR_NETWORK") return "Network error. You may be offline.";
  }

  if ("message" in error) return String((error as { message: string }).message);
  return "An unexpected error occurred.";
}
