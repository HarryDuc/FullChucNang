import { API_ROUTES } from '@/config/apiRoutes';
import api from '@/config/api';
import { ICreateSpecification, IUpdateSpecification } from '../models/specification.model';

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

  async getByCategoryIds(categoryIds: string[]) {
    const response = await api.get(API_ROUTES.SPECIFICATIONS.GET_BY_CATEGORIES, {
      params: { categories: categoryIds.join(',') },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  async create(data: ICreateSpecification) {
    const response = await api.post(API_ROUTES.SPECIFICATIONS.CREATE, data, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  async update(slug: string, data: IUpdateSpecification) {
    const response = await api.patch(API_ROUTES.SPECIFICATIONS.UPDATE(slug), data, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  async delete(slug: string) {
    const response = await api.delete(API_ROUTES.SPECIFICATIONS.DELETE(slug), {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  async updateStatus(slug: string, isActive: boolean) {
    const response = await api.patch(API_ROUTES.SPECIFICATIONS.UPDATE_STATUS(slug), { isActive }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  }
}; 