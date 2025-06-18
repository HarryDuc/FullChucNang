// ✅ Interface cho danh mục bài viết
export interface Category {
  _id: string;
  name: string;
  slug: string; // slug danh mục bài viết
  parent: string | null; // danh mục cha
  level: number;
}

// ✅ Interface cho thông tin danh mục trong bài viết
export interface CategoryInfo {
  main: string[];
  sub: string[];
}

export interface Post {
  id: string;
  slug: string; // slug bài viết
  name: string;
  excerpt: string;
  postData: string;
  author: string;
  thumbnail: string[];
  publishedDate: string;
  category?: CategoryInfo;
}

// ✅ Định nghĩa DTO tạo bài viết
export interface CreatePostDto {
  id: string;
  name: string;
  excerpt: string;
  postData: string;
  author: string;
  thumbnail: string[];
  publishedDate: string;
  category?: CategoryInfo;
  slug: string;
}

// ✅ Định nghĩa DTO cập nhật bài viết
export interface UpdatePostDto extends CreatePostDto {
  id: string;
}
