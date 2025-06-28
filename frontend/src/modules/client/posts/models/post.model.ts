// src/models/post.model.ts

// ℹ️ Thông tin phân loại trong bài viết (nếu bạn cần hiện category)
export interface CategoryInfo {
  main: string[]; // danh mục cấp chính
  sub: string[]; // danh mục cấp phụ
}

// ✅ Enum cho trạng thái phê duyệt bài viết
export enum PostStatus {
  Draft = 'draft',
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}

// 📝 Mô hình dữ liệu bài viết
export interface Post {
  _id: string;
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  postData: string;
  author: string;
  thumbnail: string;
  publishedDate: string;
  category?: CategoryInfo;
  status: PostStatus; // trạng thái phê duyệt
  isVisible: boolean; // trạng thái hiển thị
  approvedBy?: string; // người phê duyệt
  approvedDate?: string; // ngày phê duyệt
}

export interface PaginatedPosts {
  data: Post[]; // Danh sách bài viết
  total: number; // Tổng số lượng bài viết (dùng để phân trang)
  currentPage?: number; // Trang hiện tại
  totalPages?: number; // Tổng số trang
}
