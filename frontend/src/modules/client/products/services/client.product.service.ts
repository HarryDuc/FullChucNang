export interface Category {
  id: string;
  name: string;
  level: number;
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
  basePrice: number;
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
}

const BASE_API = process.env.NEXT_PUBLIC_API_URL;
const CATEGORIES_API = `${BASE_API}/categories-product`;
const MAIN_CATEGORIES_API = `${BASE_API}/categories-product/main`;
const SUB_CATEGORIES_API = `${BASE_API}/categories-product/sub`;
const PRODUCT_API = `${BASE_API}/productapi`;

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


