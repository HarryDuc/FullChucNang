// utils/categoryCache.ts
import type { Category } from "../src/modules/client/products/services/client.product.service";

const cache: {
  mainCategories: Category[] | null;
  subCategories: Record<string, Category[]>;
} = {
  mainCategories: null,
  subCategories: {},
};

export const getCachedMainCategories = () => cache.mainCategories;
export const setCachedMainCategories = (data: Category[]) => {
  cache.mainCategories = data;
};

export const getCachedSubCategories = (parentId: string) =>
  cache.subCategories[parentId] || null;
export const setCachedSubCategories = (parentId: string, data: Category[]) => {
  cache.subCategories[parentId] = data;
};
