import { API_ROUTES } from '@/config/apiRoutes';
import api from '@/config/api';

export const specificationService = {
  async getAll(query = {}) {
    const response = await api.get(API_ROUTES.SPECIFICATIONS.GET_ALL, {
      params: query,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  async getBySlug(slug: string) {
    const response = await api.get(API_ROUTES.SPECIFICATIONS.GET_BY_SLUG(slug), {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  async getByCategoryIds(categoryIds: string) {
    const response = await api.get(API_ROUTES.SPECIFICATIONS.GET_BY_CATEGORIES(categoryIds), {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  async getByCategoryId(categoryId: string) {
    const response = await api.get(API_ROUTES.SPECIFICATIONS.GET_BY_CATEGORIES(categoryId), {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },
};