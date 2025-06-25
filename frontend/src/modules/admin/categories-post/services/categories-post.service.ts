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

export const CategoryPostService = {
  create: async (dto: CreateCategoryPostDto): Promise<{ message: string; data: CategoryPost }> => {
    const response = await api.post(API_URL + config.ROUTES.CATEGORIES_POST.CREATE, dto);
    return response.data;
  },

  update: async (slug: string, dto: UpdateCategoryPostDto): Promise<{ message: string; data: CategoryPost }> => {
    const response = await api.patch(API_URL + config.ROUTES.CATEGORIES_POST.UPDATE(slug), dto);
    return response.data;
  },

  getOne: async (slug: string): Promise<{ message: string; data: CategoryPostTree }> => {
    const response = await api.get(API_URL + config.ROUTES.CATEGORIES_POST.GET_ONE(slug));
    return response.data;
  },

  findAll: async (params?: { page?: number; limit?: number; search?: string }): Promise<{ message: string; data: CategoryPost[] }> => {
    const url = API_URL + config.ROUTES.CATEGORIES_POST.GET_ALL(params);
    const response = await api.get(url);
    return response.data;
  },

  softDelete: async (slug: string): Promise<{ message: string }> => {
    const response = await api.patch(API_URL + config.ROUTES.CATEGORIES_POST.SOFT_DELETE(slug));
    return response.data;
  },

  hardDelete: async (slug: string): Promise<{ message: string }> => {
    const response = await api.delete(API_URL + config.ROUTES.CATEGORIES_POST.DELETE(slug));
    return response.data;
  },
};

export default CategoryPostService;
