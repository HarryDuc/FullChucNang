import axios from "axios";
import { CategoriesProduct } from "../types/categories-product.types";
import { config } from "@/config/config";
import api from "@/config/api";
import { API_URL_CLIENT } from "@/config/apiRoutes";

const API_URL = API_URL_CLIENT + config.ROUTES.CATEGORIES_PRODUCT.BASE;

export const getCategoriesProduct = async (): Promise<CategoriesProduct[]> => {
  const response = await api.get<CategoriesProduct[]>(`${API_URL}`);
  return response.data;
};

export const getCategoriesProductById = async (
  id: string
): Promise<CategoriesProduct> => {
  const response = await api.get<CategoriesProduct>(`${API_URL}/id/${id}`);
  return response.data;
};

export const getCategoriesProductBySlug = async (
  slug: string
): Promise<CategoriesProduct> => {
  const response = await api.get<CategoriesProduct>(`${API_URL}/${slug}`);
  return response.data;
};

export const createCategoriesProduct = async (
  categoryData: Partial<CategoriesProduct>
): Promise<CategoriesProduct> => {
  const response = await api.post<CategoriesProduct>(
    `${API_URL}`,
    categoryData,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
  return response.data;
};

export const updateCategoriesProduct = async (
  slug: string,
  categoryData: Partial<CategoriesProduct>
): Promise<CategoriesProduct> => {
  const response = await api.put<CategoriesProduct>(
    `${API_URL}/${slug}`,
    categoryData,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
  return response.data;
};

export const deleteCategoriesProduct = async (slug: string): Promise<void> => {
  await api.delete(`${API_URL}/${slug}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
};

export const CategoriesService = {
  getAll: getCategoriesProduct,
  getById: getCategoriesProductById,
  getBySlug: getCategoriesProductBySlug,
  create: createCategoriesProduct,
  update: updateCategoriesProduct,
  delete: deleteCategoriesProduct,
};
