import { ENDPOINTS } from "@/constants/api";
import type { PaginatedResponse } from "@/types/api.types";
import type { RawProduct, RawUser } from "@/types/course.types";
import { apiClient } from "./client";

export interface ProductsParams {
  page?: number;
  limit?: number;
}

export const coursesApi = {
  getProducts: async (params: ProductsParams = {}) => {
    const { page = 1, limit = 10 } = params;
    const { data } = await apiClient.get<{
      data: PaginatedResponse<RawProduct>;
    }>(ENDPOINTS.PUBLIC.RANDOM_PRODUCTS, {
      params: {
        page,
        limit,
        inc: "category,price,thumbnail,images,title,id,description",
      },
    });
    return data.data;
  },

  getInstructors: async (params: ProductsParams = {}) => {
    const { page = 1, limit = 10 } = params;
    const { data } = await apiClient.get<{ data: PaginatedResponse<RawUser> }>(
      ENDPOINTS.PUBLIC.RANDOM_USERS,
      { params: { page, limit } },
    );
    return data.data;
  },
};
