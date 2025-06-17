/**
 * Interface cho giá trị của thuộc tính biến thể
 */
export interface VariantAttributeValue {
  value: string; // Giá trị cụ thể (VD: "Đỏ", "XL")
  slug: string;
  additionalPrice?: number; // Giá tăng thêm cho giá trị này
  discountPrice?: number; // Giá giảm nếu có
  thumbnail?: string; // Hình ảnh cho giá trị này nếu cần
  displayOrder?: number;
}

/**
 * Interface cho thuộc tính biến thể
 */
export interface VariantAttribute {
  name: string; // Tên thuộc tính (VD: "Màu sắc", "Kích thước")
  slug: string;
  description?: string;
  displayOrder?: number;
  values: VariantAttributeValue[];
}

/**
 * Interface cho combination của biến thể
 */
export interface VariantCombination {
  attributeName: string;
  value: string;
}

/**
 * Interface cho biến thể sản phẩm
 */
export interface ProductVariant {
  variantName: string; // Tên biến thể (VD: "Áo thun đỏ size L")
  combination: VariantCombination[]; // Tổ hợp các thuộc tính
  sku?: string;
  variantImportPrice?: number;
  variantCurrentPrice?: number;
  variantDiscountPrice?: number;
  variantStock?: number;
  variantSold?: number;
  variantThumbnail?: string;
  variantGalleries?: string[];
}

/**
 * Interface cho thông tin danh mục
 */
export interface CategoryInfo {
  main: string;
  sub: string[];
  tags: string[];
  title?: string;
  key?: string;
  url?: string;
  id?: string;
  name?: string;
  slug?: string;
}

/**
 * Interface cho thông tin SEO
 */
export interface SeoInfo {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
}

/**
 * Interface cho thông tin tồn kho
 */
export interface StockInfo {
  totalStock?: number;
  lowStockThreshold?: number;
  stockStatus?: 'inStock' | 'lowStock' | 'outOfStock';
}

/**
 * Interface cho thông tin khuyến mãi
 */
export interface PromotionInfo {
  isOnSale?: boolean;
  saleStartDate?: Date;
  saleEndDate?: Date;
  salePrice?: number;
  salePercentage?: number;
}

/**
 * Interface chính cho sản phẩm
 */
export interface Product {
  id?: string;
  _id?: string;
  name: string;
  slug: string;
  sku?: string;
  description?: string;
  shortDescription?: string;

  // Thông tin giá
  basePrice: number; // Giá cơ bản (bắt buộc)
  importPrice?: number;
  currentPrice?: number;
  discountPrice?: number;

  // Thông tin hình ảnh
  thumbnail?: string;
  gallery?: string[];

  // Trạng thái và phân loại
  isVisible?: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  status?: 'draft' | 'published' | 'archived' | 'outOfStock' | 'comingSoon';

  // Thông tin phân loại
  category?: CategoryInfo;

  // Thông tin biến thể
  variantAttributes?: VariantAttribute[];
  variants?: ProductVariant[];

  // Thông tin bổ sung
  seo?: SeoInfo;
  tags?: string[];
  displayOrder?: number;
  viewCount?: number;
  soldCount?: number;
  stockInfo?: StockInfo;
  promotion?: PromotionInfo;

  // Thông tin thời gian
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
