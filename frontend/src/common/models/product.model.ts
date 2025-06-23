export interface ClientProduct {
  _id: string; // ID sản phẩm từ MongoDB
  name: string; // Tên sản phẩm
  slug: string; // Slug SEO
  basePrice: number; // Giá gốc
  currentPrice: number; // Giá hiện tại
  discountPrice: number; // Giá sau giảm
  thumbnail: string; // Hình ảnh đại diện
}
