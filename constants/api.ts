export const API_BASE_URL = "https://api.freeapi.app";

export const API_TIMEOUT = 15_000;
export const API_MAX_RETRIES = 3;

export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/v1/users/login",
    REGISTER: "/api/v1/users/register",
    LOGOUT: "/api/v1/users/logout",
    CURRENT_USER: "/api/v1/users/current-user",
    REFRESH_TOKEN: "/api/v1/users/refresh-token",
  },
  PUBLIC: {
    RANDOM_PRODUCTS: "/api/v1/public/randomproducts",
    RANDOM_USERS: "/api/v1/public/randomusers",
  },
} as const;
