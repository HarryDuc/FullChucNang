import { apiRoutes } from '../../../../config/apiRoutes';
import api from '../../../../config/api';
import { CategoryFilter } from '../hooks/useCategoryFilters';

export const getFiltersByCategory = async (categoryId: string): Promise<CategoryFilter[]> => {
  try {
    const response = await api.get(`${apiRoutes.FILTERS.BASE}/category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching filters by category:', error);
    throw new Error('Failed to fetch filters');
  }
}; 