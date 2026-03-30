import { ENDPOINTS } from "@/constants/api";
import type { User } from "@/types/auth.types";
import { apiClient } from "./client";

export const profileApi = {
  getCurrentUser: async (): Promise<User> => {
    const { data } = await apiClient.get<{ data: User }>(
      ENDPOINTS.AUTH.CURRENT_USER,
    );
    return data.data;
  },

  updateAvatar: async (imageUri: string): Promise<User> => {
    const formData = new FormData();
    const filename = imageUri.split("/").pop() ?? "avatar.jpg";
    const ext = filename.split(".").pop() ?? "jpg";
    const mimeType = ext === "png" ? "image/png" : "image/jpeg";

    formData.append("avatar", {
      uri: imageUri,
      name: filename,
      type: mimeType,
    } as unknown as Blob);

    const { data } = await apiClient.patch<{ data: User }>(
      "/api/v1/users/avatar",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data.data;
  },
};
