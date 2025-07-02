export interface VariantAttribute {
  groupName: string; // Nhóm biến thể (VD: "Màu sắc", "Kích cỡ")
  value: string; // Giá trị cụ thể (VD: "Đỏ", "M")
}

export interface ProductVariant {
  // name: string; // Tên biến thể (VD: "Màu đỏ", "Size L")
  variantName: string; // Tên biến thể (VD: "Đỏ", "Size L")
  attributes: VariantAttribute[]; // Chi tiết thuộc tính biến thể
  variantImportPrice?: number;
  variantCurrentPrice?: number;
  variantDiscountPrice?: number;
  variantThumbnail?: string; // URL hình đại diện
  variantGalleries?: string[]; // Mảng URL ảnh
  variantStock?: number;
  variantSold?: number;
}

export interface CategoryInfo {
  main: string;
  sub: string[];
  tags: string[];
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  sku?: string;
  description?: string;
  shortDescription?: string;
  basePrice?: number;
  currentPrice?: number;
  discountPrice?: number;
  thumbnail?: string;
  gallery?: string[];
  isVisible?: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  status?: string;
  category?: {
    main: string;
    sub: string[];
    tags: string[];
  };
  hasVariants?: boolean;
  variantAttributes?: any[];
  variants?: any[];
  stock?: number;
  sold?: number;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}
