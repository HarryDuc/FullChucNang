import api from '@/config/api';
import { API_URL_CLIENT } from '@/config/apiRoutes';

export interface CategoryFilter {
  _id: string;
  name: string;
  slug: string;
  type: 'text' | 'number' | 'range' | 'checkbox' | 'select';
  options: string[];
}

export interface FilterResponse {
  data: any[];
  total: number;
  page: number;
  totalPages: number;
}

const API_URL = API_URL_CLIENT + '/productsapi';

export const getCategoryFilters = async (categoryId: string): Promise<CategoryFilter[]> => {
  try {
    console.log('Fetching filters for category:', categoryId);
    const response = await api.get<CategoryFilter[]>(`${API_URL}/category/${categoryId}/filters`);
    console.log('Category filters response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching category filters:', error);
    throw error;
  }
};

export const filterProducts = async (
  categoryId: string | null,
  filters: Record<string, any>,
  page: number = 1,
  limit: number = 12
): Promise<FilterResponse> => {
  try {
    console.log('Filtering products with:', { categoryId, filters, page, limit });
    
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const url = categoryId 
      ? `${API_URL}/category/${categoryId}/filter`
      : `${API_URL}/filter`;

    console.log('Filter request URL:', url);
    console.log('Filter request body:', { filters });

    const response = await api.post<FilterResponse>(url, { filters }, {
      params: Object.fromEntries(params)
    });

    console.log('Filter response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error filtering products:', error);
    // Return empty response instead of throwing
    return {
      data: [],
      total: 0,
      page,
      totalPages: 0
    };
  }
}; 