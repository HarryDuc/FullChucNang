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
  id?: string;
  variantName: string; // Tên biến thể (VD: "Áo thun đỏ size L")
  combination: VariantCombination[]; // Tổ hợp các thuộc tính
  sku?: string;
  variantImportPrice?: number;
  variantCurrentPrice?: number;
  variantDiscountPrice?: number;
  variantStock?: number; // Changed from required to optional
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
  _id?: string;
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
  totalStock: number; // Tổng số lượng tồn kho
  lowStockThreshold?: number;
  stockStatus: 'inStock' | 'lowStock' | 'outOfStock';
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
 * Interface cho thông số kỹ thuật
 */
export interface TechnicalSpec {
  name: string;
  value: string;
}

export interface SpecificationGroup {
  title: string;
  specs: TechnicalSpec[];
}

export interface Specification {
  title: string;
  groups: SpecificationGroup[];
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
  status: 'draft' | 'published' | 'archived' | 'outOfStock' | 'comingSoon';

  // Thông tin phân loại
  category?: CategoryInfo;

  // Thông tin biến thể
  hasVariants: boolean; // Có biến thể hay không
  variantAttributes?: VariantAttribute[];
  variants?: ProductVariant[];

  // Thông tin tồn kho
  stock: number; // Số lượng tồn kho (cho sản phẩm không có biến thể)
  sold: number; // Số lượng đã bán (cho sản phẩm không có biến thể)
  stockInfo?: StockInfo;

  // Thông tin bổ sung
  seo?: SeoInfo;
  tags?: string[];
  displayOrder?: number;
  viewCount?: number;
  promotion?: PromotionInfo;

  // Thông số kỹ thuật
  specification?: Specification;

  // Thông tin thời gian
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interface cho item trong giỏ hàng
 */
export interface CartItem {
  _id: string;
  name: string;
  slug: string;
  variant?: string;
  currentPrice?: number;
  discountPrice?: number;
  price: number;
  quantity: number;
  image: string;
  sku?: string;
  variantId?: string;
  stock: number; // Số lượng tồn kho hiện tại
}
