// 📁 src/modules/categories-post/services/categories-post.service.ts

import {
  CategoryPost,
  CategoryPostTree,
  CreateCategoryPostDto,
  UpdateCategoryPostDto,
} from "../models/categories-post.model";

import { config } from '@/config/config';
import api from '@/config/api';
import { API_URL_CLIENT } from '@/config/apiRoutes';

const API_URL = API_URL_CLIENT + config.ROUTES.CATEGORIES_POST.BASE;

export interface CategoryPostResponse<T> {
  message: string;
  data: T;
  total?: number;
}

export const CategoryPostService = {
  create: async (dto: CreateCategoryPostDto): Promise<CategoryPostResponse<CategoryPost>> => {
    const response = await api.post(API_URL, dto, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  },

  update: async (slug: string, dto: UpdateCategoryPostDto): Promise<CategoryPostResponse<CategoryPost>> => {
    const response = await api.patch(`${API_URL}/${slug}`, dto, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  },

  getOne: async (slug: string): Promise<CategoryPostResponse<CategoryPostTree>> => {
    const response = await api.get(`${API_URL}/${slug}`);
    return response.data;
  },

  findAll: async (params?: { page?: number; limit?: number; search?: string }): Promise<CategoryPostResponse<CategoryPostTree[]>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const url = `${API_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  softDelete: async (slug: string): Promise<CategoryPostResponse<void>> => {
    const response = await api.patch(`${API_URL}/${slug}/soft-delete`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  hardDelete: async (slug: string): Promise<CategoryPostResponse<void>> => {
    const response = await api.delete(`${API_URL}/${slug}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },
};

export default CategoryPostService;
