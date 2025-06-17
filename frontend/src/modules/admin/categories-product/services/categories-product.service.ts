import axios from "axios";
import { CategoriesProduct } from "../types/categories-product.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL + "/categories-product";

export const getCategoriesProduct = async (): Promise<CategoriesProduct[]> => {
  const response = await axios.get<CategoriesProduct[]>(`${API_URL}`);
  return response.data;
};

export const getCategoriesProductById = async (
  id: string
): Promise<CategoriesProduct> => {
  const response = await axios.get<CategoriesProduct>(`${API_URL}/id/${id}`);
  return response.data;
};

export const getCategoriesProductBySlug = async (
  slug: string
): Promise<CategoriesProduct> => {
  const response = await axios.get<CategoriesProduct>(`${API_URL}/${slug}`);
  return response.data;
};

export const createCategoriesProduct = async (
  categoryData: Partial<CategoriesProduct>
): Promise<CategoriesProduct> => {
  const response = await axios.post<CategoriesProduct>(
    `${API_URL}`,
    categoryData
  );
  return response.data;
};

export const updateCategoriesProduct = async (
  slug: string,
  categoryData: Partial<CategoriesProduct>
): Promise<CategoriesProduct> => {
  const response = await axios.put<CategoriesProduct>(
    `${API_URL}/${slug}`,
    categoryData
  );
  return response.data;
};

export const deleteCategoriesProduct = async (slug: string): Promise<void> => {
  await axios.delete(`${API_URL}/${slug}`);
};

export const CategoriesService = {
  getAll: getCategoriesProduct,
  getById: getCategoriesProductById,
  getBySlug: getCategoriesProductBySlug,
  create: createCategoriesProduct,
  update: updateCategoriesProduct,
  delete: deleteCategoriesProduct,
};
