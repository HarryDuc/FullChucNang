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
  id?: string; // id cũ, giữ lại để tương thích ngược
  _id?: string; // _id từ MongoDB
  name: string;
  slug: string;
  sku?: string;
  description?: string;
  shortDescription?: string; // Mô tả ngắn của sản phẩm
  importPrice?: number;
  basePrice?: number;
  currentPrice?: number;
  discountPrice?: number;
  thumbnail?: string;
  gallery?: string[];
  stock?: number;
  sold?: number;
  category?: CategoryInfo;
  // Danh sách biến thể thành phẩm để hiển thị giá trị thực tế cho người mua
  productVariants?: ProductVariant[];
  publishedAt?: string; // Ngày giờ đăng sản phẩm (ISO string)
  createdAt?: string;
  updatedAt?: string;
}
