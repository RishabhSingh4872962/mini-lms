import { ENDPOINTS } from "@/constants/api";
import type {
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    User,
} from "@/types/auth.types";
import { apiClient } from "./client";

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(
      ENDPOINTS.AUTH.LOGIN,
      credentials,
    );
    return data;
  },

  register: async (
    payload: Omit<RegisterRequest, "role"> & { role?: string },
  ): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(
      ENDPOINTS.AUTH.REGISTER,
      {
        ...payload,
        role: "USER",
      },
    );
    console.log(",l,,;,;,;,", data);
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
  },

  getCurrentUser: async (): Promise<{ data: User }> => {
    const { data } = await apiClient.get<{ data: User }>(
      ENDPOINTS.AUTH.CURRENT_USER,
    );
    return data;
  },
};
