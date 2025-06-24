/**
 * Standard API response structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

/**
 * Pagination information
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T = any> {
  success: boolean;
  message: string;
  data: T[];
  pagination: PaginationInfo;
  errors?: string[];
}