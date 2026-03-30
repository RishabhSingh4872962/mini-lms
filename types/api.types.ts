export interface ApiError {
  statusCode: number;
  message: string;
  success: false;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  page: number;
  limit: number;
  totalPages: number;
  previousPage: boolean;
  nextPage: boolean;
  totalItems: number;
  currentPageItems: number;
  data: T[];
}
