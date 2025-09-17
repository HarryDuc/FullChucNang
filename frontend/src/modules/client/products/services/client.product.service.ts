export interface Category {
  id: string;
  _id: string;
  name: string;
  level: number;
  isActive: boolean;
  slug: string;
}

export interface VariantAttributeValue {
  value: string;
  slug: string;
  additionalPrice?: number;
  discountPrice?: number;
  thumbnail?: string;
  displayOrder?: number;
}

export interface VariantAttribute {
  name: string;
  slug: string;
  description?: string;
  displayOrder?: number;
  values: VariantAttributeValue[];
}

export interface ProductVariant {
  id?: string;
  variantName: string;
  combination: { attributeName: string; value: string }[];
  sku?: string;
  variantImportPrice?: number;
  variantCurrentPrice?: number;
  variantDiscountPrice?: number;
  variantStock: number;
  variantSold: number;
  variantThumbnail?: string;
  variantGalleries?: string[];
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  currentPrice: number;
  discountPrice: number;
  thumbnail: string;
  isVisible?: boolean;
  category: {
    main: string;
    _id: string;
    sub: string[];
    tags: string[];
  };
  createdAt: string;
  publishedAt: string;
  sku: string;
  description?: string;
  shortDescription?: string;
  basePrice?: number;
  importPrice?: number;
  gallery?: string[];
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  stock: number;
  sold: number;
  status: 'draft' | 'published' | 'archived' | 'outOfStock' | 'comingSoon';
  hasVariants: boolean;
  variantAttributes?: VariantAttribute[];
  variants?: ProductVariant[];
  specification?: Specification;
  specificationDescription?: string;
}

import { config } from "@/config/config";
import { API_URL_CLIENT, API_ROUTES } from "@/config/apiRoutes";
import { Product as ProductType } from '@/modules/admin/products/models/product.model';
import axios from 'axios';

export interface ProductFilter {
  name?: string;
  minPrice?: number;
  maxPrice?: number;
  hasVariants?: boolean;
  filterAttributes?: Record<string, any>;
}

const CATEGORIES_API = API_URL_CLIENT + config.ROUTES.CATEGORIES_PRODUCT.BASE;
const MAIN_CATEGORIES_API = `${CATEGORIES_API}/main`;
const SUB_CATEGORIES_API = `${CATEGORIES_API}/sub`;
const PRODUCT_API = API_URL_CLIENT + config.ROUTES.PRODUCTS.BASE;

/**
 * Hàm hỗ trợ gọi API và trả về dữ liệu dạng JSON với xử lý lỗi chung.
 * @param url Đường dẫn API
 * @param options Cấu hình tùy chọn của fetch
 * @returns Dữ liệu trả về sau khi chuyển đổi JSON
 */
async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Lỗi khi tải dữ liệu từ ${url}: ${response.statusText}`);
  }
  return response.json();
}

/**
 * ✅ Lấy danh sách danh mục cha (level = 0, active)
 */
export const getMainCategories = async (signal?: AbortSignal) => {
  return fetchJSON<Category[]>(MAIN_CATEGORIES_API, { signal });
};

/**
 * ✅ Lấy danh sách danh mục con theo ID danh mục cha (active)
 * @param parentId ID của danh mục cha
 */
export const getSubCategoriesByParentId = async (
  parentId: string,
  signal?: AbortSignal
) => {
  return fetchJSON<Category[]>(`${SUB_CATEGORIES_API}/${parentId}`, { signal });
};

/**
 * ✅ Lấy danh sách thông tin cơ bản của tất cả sản phẩm (hỗ trợ phân trang)
 * @param page Số trang muốn lấy
 * @param signal Tín hiệu hủy request (tùy chọn)
 */
export const getAllProducts = async (
  page: number = 1,
  signal?: AbortSignal
) => {
  const url = `${PRODUCT_API}/basic-info?page=${page}`;
  return fetchJSON<{
    data: Product[];
    total: number;
    page: number;
    totalPages: number;
  }>(url, { signal });
};

export const getProductsByMainCategory = async (
  mainCategory: string,
  page: number = 1,
  signal?: AbortSignal
) => {
  const encodedCategory = encodeURIComponent(mainCategory);
  const url = `${PRODUCT_API}/bycategory/${encodedCategory}?page=${page}`;
  return fetchJSON<{
    data: Product[];
    total: number;
    page: number;
    totalPages: number;
  }>(url, { signal });
};

/**
 * ✅ Lấy danh sách sản phẩm theo danh mục phụ.
 * @param subCategory Tên danh mục phụ.
 * @param page Số trang (mặc định là 1).
 * @param signal Tín hiệu hủy request (tùy chọn)
 * @returns Danh sách sản phẩm và thông tin phân trang.
 */
export const getProductsBySubCategory = async (
  subCategory: string,
  page: number = 1,
  signal?: AbortSignal
) => {
  const url = `${PRODUCT_API}/bysubcategory/${encodeURIComponent(
    subCategory
  )}?page=${page}`;
  return fetchJSON<{
    data: Product[];
    total: number;
    page: number;
    totalPages: number;
  }>(url, { signal });
};

/**
 * ✅ Lấy thông tin danh mục theo slug
 * @param slug Slug của danh mục
 * @returns Thông tin danh mục (id, name, slug, v.v.)
 */
export const getCategoryBySlug = async (slug: string, signal?: AbortSignal) => {
  const url = `${CATEGORIES_API}/${encodeURIComponent(slug)}`;
  return fetchJSON<Category>(url, { signal });
};

export const getProductsByCategory = async (
  categoryId: string | null,
  filters: ProductFilter = {},
  page: number = 1,
  limit: number = 12
): Promise<{
  data: ProductType[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  try {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId);
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());

    // Add filter parameters
    if (filters.name) params.append('name', filters.name);
    if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.hasVariants !== undefined) params.append('hasVariants', filters.hasVariants.toString());

    // Add filter attributes
    if (filters.filterAttributes) {
      Object.entries(filters.filterAttributes).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(`filterAttributes[${key}]`, Array.isArray(value) ? JSON.stringify(value) : value.toString());
        }
      });
    }

    const response = await axios.get(`${API_ROUTES.PRODUCTS}/category?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
};


export const getProductsByMainAndSubCategory = async (
  mainCategory: string,
  subCategory: string,
  page: number = 1,
) => {
  const encodedCategoryMain = encodeURIComponent(mainCategory);
  const encodedCategorySub = encodeURIComponent(subCategory);
  const urlMain = `${PRODUCT_API}/bycategory/${encodedCategoryMain}?page=${page}`;
  const urlSub = `${PRODUCT_API}/bysubcategory/${encodedCategorySub}?page=${page}`;
  const response = await axios.all([
    axios.get(urlMain),
    axios.get(urlSub)
  ]);
  const data = response.map(r => r.data);
  return data;
};
