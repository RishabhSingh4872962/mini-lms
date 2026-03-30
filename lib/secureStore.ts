import * as SecureStore from "expo-secure-store";

const KEYS = {
  ACCESS_TOKEN: "lms_access_token",
  REFRESH_TOKEN: "lms_refresh_token",
} as const;

export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
    } catch {
      return null;
    }
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
    } catch {
      return null;
    }
  },

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, accessToken),
      SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refreshToken),
    ]);
  },

  async clearTokens(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN).catch(() => null),
      SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN).catch(() => null),
    ]);
  },
};
