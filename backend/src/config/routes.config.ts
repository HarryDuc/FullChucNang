/**
 * Cấu hình đường dẫn chuẩn cho toàn hệ thống
 * Giúp tránh hard-coding đường dẫn và dễ dàng thay đổi trong tương lai
 */
export const FRONTEND_ROUTES = {
  // Đường dẫn cho sản phẩm
  PRODUCTS: {
    LIST: '/san-pham',
    DETAIL: (slug: string) => `/san-pham/${slug}`,
  },
  
  // Đường dẫn cho danh mục sản phẩm
  CATEGORIES: {
    LIST: '/category',
    DETAIL: (slug: string) => `/category/${slug}`,
  },
  
  // Đường dẫn cho bài viết
  POSTS: {
    LIST: '/posts',
    DETAIL: (slug: string) => `/posts/${slug}`,
    CATEGORY: (slug: string) => `/posts/danh-muc/${slug}`,
  },
  
  // Các đường dẫn chung khác
  COMMON: {
    HOME: '/',
    CONTACT: '/lien-he',
    ABOUT: '/gioi-thieu',
  }
}; 